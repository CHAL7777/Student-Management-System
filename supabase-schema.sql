create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'teacher', 'student');
  end if;
end
$$;

create table if not exists public.departments (
  department_id uuid primary key default uuid_generate_v4(),
  department_name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teachers (
  teacher_id text primary key,
  name text not null,
  department_id uuid not null references public.departments(department_id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.classes (
  class_id uuid primary key default uuid_generate_v4(),
  class_name text not null unique,
  homeroom_teacher_id text references public.teachers(teacher_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subjects (
  subject_id uuid primary key default uuid_generate_v4(),
  subject_name text not null unique,
  total_mark integer not null default 100 check (total_mark > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.students (
  student_id text primary key,
  name text not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  grade text not null,
  academic_year text not null,
  semester text not null,
  class_id uuid references public.classes(class_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marks (
  student_id text not null references public.students(student_id) on delete cascade,
  subject_id uuid not null references public.subjects(subject_id) on delete cascade,
  mark numeric(5,2) not null check (mark between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (student_id, subject_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  login_id text,
  role public.app_role not null,
  student_id text unique references public.students(student_id) on delete cascade,
  teacher_id text unique references public.teachers(teacher_id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_role_link_check check (
    (role = 'student' and student_id is not null and teacher_id is null)
    or (role = 'teacher' and teacher_id is not null and student_id is null)
    or (role = 'admin' and student_id is null and teacher_id is null)
  )
);

alter table public.profiles
add column if not exists login_id text;

alter table public.students
alter column student_id drop default;

alter table public.teachers
alter column teacher_id drop default;

create unique index if not exists profiles_login_id_unique_idx
on public.profiles (lower(login_id))
where login_id is not null;

comment on column public.profiles.login_id is
'Human-readable identifier used during login, such as ADM-001, TCH-101, or STD-001.';

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_profile_updated_at();

create or replace view public.student_subject_report as
select
  s.student_id,
  s.name as student_name,
  s.grade,
  s.academic_year,
  s.semester,
  c.class_name,
  sub.subject_id,
  sub.subject_name,
  coalesce(m.mark, 0) as mark,
  case when coalesce(m.mark, 0) >= 50 then 'Pass' else 'Fail' end as status
from public.students s
left join public.classes c on c.class_id = s.class_id
cross join public.subjects sub
left join public.marks m
  on m.student_id = s.student_id
 and m.subject_id = sub.subject_id;

create or replace view public.student_report_summary as
select
  s.student_id,
  s.name as student_name,
  s.grade,
  s.academic_year,
  s.semester,
  c.class_name,
  coalesce(sum(m.mark), 0) as total,
  coalesce(avg(m.mark), 0) as average,
  rank() over (order by coalesce(sum(m.mark), 0) desc) as rank
from public.students s
left join public.classes c on c.class_id = s.class_id
left join public.marks m on m.student_id = s.student_id
group by s.student_id, s.name, s.grade, s.academic_year, s.semester, c.class_name;

alter table public.departments enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.marks enable row level security;
alter table public.profiles enable row level security;

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.resolve_login_email(p_full_name text, p_login_id text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resolved_email text;
begin
  select u.email
  into resolved_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(trim(p.full_name)) = lower(trim(p_full_name))
    and lower(trim(coalesce(p.login_id, ''))) = lower(trim(p_login_id))
  limit 1;

  return resolved_email;
end;
$$;

grant execute on function public.resolve_login_email(text, text) to anon, authenticated;

create or replace function public.build_hidden_login_email(p_role public.app_role, p_login_id text)
returns text
language sql
immutable
as $$
  select format(
    '%s.%s@student-result-system.com',
    p_role::text,
    trim(both '-' from regexp_replace(lower(trim(p_login_id)), '[^a-z0-9]+', '-', 'g'))
  )
$$;

create or replace function public.create_student_with_account(
  p_student_id text,
  p_full_name text,
  p_gender text,
  p_grade text,
  p_academic_year text,
  p_semester text,
  p_class_id uuid,
  p_password text
)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_hidden_email text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create student accounts';
  end if;

  v_hidden_email := public.build_hidden_login_email('student', p_student_id);
  v_user_id := gen_random_uuid();

  insert into public.students (
    student_id,
    name,
    gender,
    grade,
    academic_year,
    semester,
    class_id
  ) values (
    trim(p_student_id),
    trim(p_full_name),
    p_gender,
    trim(p_grade),
    trim(p_academic_year),
    trim(p_semester),
    p_class_id
  );

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_hidden_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    timezone('utc', now()),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', trim(p_full_name), 'login_id', trim(p_student_id)),
    '',
    '',
    '',
    '',
    timezone('utc', now()),
    timezone('utc', now()),
    false,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_hidden_email, 'email_verified', true),
    'email',
    v_hidden_email,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  );

  insert into public.profiles (
    id,
    full_name,
    login_id,
    role,
    student_id,
    teacher_id
  ) values (
    v_user_id,
    trim(p_full_name),
    trim(p_student_id),
    'student',
    trim(p_student_id),
    null
  );

  return trim(p_student_id);
end;
$$;

create or replace function public.create_teacher_with_account(
  p_teacher_id text,
  p_full_name text,
  p_department_id uuid,
  p_password text
)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_hidden_email text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create teacher accounts';
  end if;

  v_hidden_email := public.build_hidden_login_email('teacher', p_teacher_id);
  v_user_id := gen_random_uuid();

  insert into public.teachers (
    teacher_id,
    name,
    department_id
  ) values (
    trim(p_teacher_id),
    trim(p_full_name),
    p_department_id
  );

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_hidden_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    timezone('utc', now()),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', trim(p_full_name), 'login_id', trim(p_teacher_id)),
    '',
    '',
    '',
    '',
    timezone('utc', now()),
    timezone('utc', now()),
    false,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_hidden_email, 'email_verified', true),
    'email',
    v_hidden_email,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  );

  insert into public.profiles (
    id,
    full_name,
    login_id,
    role,
    student_id,
    teacher_id
  ) values (
    v_user_id,
    trim(p_full_name),
    trim(p_teacher_id),
    'teacher',
    null,
    trim(p_teacher_id)
  );

  return trim(p_teacher_id);
end;
$$;

grant execute on function public.create_student_with_account(text, text, text, text, text, text, uuid, text) to authenticated;
grant execute on function public.create_teacher_with_account(text, text, uuid, text) to authenticated;

create policy "authenticated users can read own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.current_role() = 'admin'
);

create policy "admins manage profiles"
on public.profiles
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "admins manage departments"
on public.departments
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "admins manage teachers and teachers can read"
on public.teachers
for select
to authenticated
using (public.current_role() in ('admin', 'teacher'));

create policy "admins modify teachers"
on public.teachers
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "authenticated users can read classes"
on public.classes
for select
to authenticated
using (true);

create policy "admins manage classes"
on public.classes
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "authenticated users can read subjects"
on public.subjects
for select
to authenticated
using (true);

create policy "admins manage subjects"
on public.subjects
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "admins and teachers read students"
on public.students
for select
to authenticated
using (
  public.current_role() in ('admin', 'teacher')
  or student_id = (
    select student_id from public.profiles where id = auth.uid()
  )
);

create policy "admins manage students"
on public.students
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "admins teachers and owner read marks"
on public.marks
for select
to authenticated
using (
  public.current_role() in ('admin', 'teacher')
  or student_id = (
    select student_id from public.profiles where id = auth.uid()
  )
);

create policy "teachers manage marks"
on public.marks
for insert
to authenticated
with check (public.current_role() = 'teacher');

create policy "teachers update marks"
on public.marks
for update
to authenticated
using (public.current_role() = 'teacher')
with check (public.current_role() = 'teacher');
