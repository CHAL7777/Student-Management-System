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

create table if not exists public.subjects (
  subject_id uuid primary key default uuid_generate_v4(),
  subject_name text not null unique,
  total_mark integer not null default 100 check (total_mark > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teachers (
  teacher_id text primary key,
  name text not null,
  subject_id uuid references public.subjects(subject_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.classes (
  class_id uuid primary key default uuid_generate_v4(),
  class_name text not null unique,
  homeroom_teacher_id text references public.teachers(teacher_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teacher_class_assignments (
  teacher_id text not null references public.teachers(teacher_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (teacher_id, class_id)
);

alter table public.teachers
add column if not exists subject_id uuid references public.subjects(subject_id) on delete set null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'teachers'
      and column_name = 'department_id'
  ) then
    alter table public.teachers
    alter column department_id drop not null;
  end if;
end
$$;

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

alter table public.teachers enable row level security;
alter table public.teacher_class_assignments enable row level security;
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

create or replace function public.current_teacher_subject_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select t.subject_id
  from public.profiles p
  join public.teachers t on t.teacher_id = p.teacher_id
  where p.id = auth.uid()
$$;

create or replace function public.current_teacher_class_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(tca.class_id), array[]::uuid[])
  from public.profiles p
  join public.teacher_class_assignments tca on tca.teacher_id = p.teacher_id
  where p.id = auth.uid()
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
grant execute on function public.current_teacher_subject_id() to authenticated;
grant execute on function public.current_teacher_class_ids() to authenticated;

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

create or replace function public.change_own_password(
  p_current_password text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_encrypted_password text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(length(p_current_password), 0) = 0 then
    raise exception 'Current password is required';
  end if;

  if coalesce(length(p_new_password), 0) < 6 then
    raise exception 'New password must be at least 6 characters';
  end if;

  select encrypted_password
  into v_encrypted_password
  from auth.users
  where id = v_user_id
  for update;

  if v_encrypted_password is null then
    raise exception 'Account not found';
  end if;

  if v_encrypted_password <> extensions.crypt(p_current_password, v_encrypted_password) then
    raise exception 'Current password is incorrect';
  end if;

  if v_encrypted_password = extensions.crypt(p_new_password, v_encrypted_password) then
    raise exception 'Choose a different new password';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      updated_at = timezone('utc', now())
  where id = v_user_id;

  return true;
end;
$$;

grant execute on function public.change_own_password(text, text) to authenticated;

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
  v_login_id text;
  v_hidden_email text;
  v_conflicting_login_id text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create student accounts';
  end if;

  v_login_id := trim(p_student_id);
  v_hidden_email := public.build_hidden_login_email('student', v_login_id);
  v_user_id := gen_random_uuid();

  if v_login_id = '' then
    raise exception 'Student ID is required';
  end if;

  if exists (
    select 1
    from public.students
    where lower(student_id) = lower(v_login_id)
  ) then
    raise exception 'A student with this ID already exists';
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(coalesce(login_id, '')) = lower(v_login_id)
  ) then
    raise exception 'An account with this login ID already exists';
  end if;

  select coalesce(p.login_id, u.email)
  into v_conflicting_login_id
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.email = v_hidden_email
  limit 1;

  if v_conflicting_login_id is not null then
    if lower(v_conflicting_login_id) = lower(v_login_id) then
      raise exception 'An account with this ID already exists';
    end if;

    raise exception 'This student ID conflicts with existing account ID "%". Use a different ID.', v_conflicting_login_id;
  end if;

  insert into public.students (
    student_id,
    name,
    gender,
    grade,
    academic_year,
    semester,
    class_id
  ) values (
    v_login_id,
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
    jsonb_build_object('full_name', trim(p_full_name), 'login_id', v_login_id),
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
    v_login_id,
    'student',
    v_login_id,
    null
  );

  return v_login_id;
end;
$$;

drop function if exists public.create_teacher_with_account(text, text, uuid, text);

create or replace function public.create_teacher_with_account(
  p_teacher_id text,
  p_full_name text,
  p_subject_id uuid,
  p_password text,
  p_class_ids uuid[] default array[]::uuid[]
)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_login_id text;
  v_hidden_email text;
  v_conflicting_login_id text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create teacher accounts';
  end if;

  v_login_id := trim(p_teacher_id);
  v_hidden_email := public.build_hidden_login_email('teacher', v_login_id);
  v_user_id := gen_random_uuid();

  if v_login_id = '' then
    raise exception 'Teacher ID is required';
  end if;

  if exists (
    select 1
    from public.teachers
    where lower(teacher_id) = lower(v_login_id)
  ) then
    raise exception 'A teacher with this ID already exists';
  end if;

  if exists (
    select 1
    from public.profiles
    where lower(coalesce(login_id, '')) = lower(v_login_id)
  ) then
    raise exception 'An account with this login ID already exists';
  end if;

  select coalesce(p.login_id, u.email)
  into v_conflicting_login_id
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.email = v_hidden_email
  limit 1;

  if v_conflicting_login_id is not null then
    if lower(v_conflicting_login_id) = lower(v_login_id) then
      raise exception 'An account with this ID already exists';
    end if;

    raise exception 'This teacher ID conflicts with existing account ID "%". Use a different ID.', v_conflicting_login_id;
  end if;

  insert into public.teachers (
    teacher_id,
    name,
    subject_id
  ) values (
    v_login_id,
    trim(p_full_name),
    p_subject_id
  );

  insert into public.teacher_class_assignments (teacher_id, class_id)
  select v_login_id, class_id
  from unnest(coalesce(p_class_ids, array[]::uuid[])) as class_id;

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
    jsonb_build_object('full_name', trim(p_full_name), 'login_id', v_login_id),
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
    v_login_id,
    'teacher',
    null,
    v_login_id
  );

  return v_login_id;
end;
$$;

grant execute on function public.create_student_with_account(text, text, text, text, text, text, uuid, text) to authenticated;
grant execute on function public.create_teacher_with_account(text, text, uuid, text, uuid[]) to authenticated;

drop policy if exists "authenticated users can read own profile" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "admins manage teachers and teachers can read" on public.teachers;
drop policy if exists "admins modify teachers" on public.teachers;
drop policy if exists "admins manage teacher class assignments" on public.teacher_class_assignments;
drop policy if exists "teachers read own class assignments" on public.teacher_class_assignments;
drop policy if exists "authenticated users can read classes" on public.classes;
drop policy if exists "admins manage classes" on public.classes;
drop policy if exists "authenticated users can read subjects" on public.subjects;
drop policy if exists "admins manage subjects" on public.subjects;
drop policy if exists "admins and teachers read students" on public.students;
drop policy if exists "admins manage students" on public.students;
drop policy if exists "admins teachers and owner read marks" on public.marks;
drop policy if exists "teachers manage marks" on public.marks;
drop policy if exists "teachers update marks" on public.marks;

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

create policy "admins manage teacher class assignments"
on public.teacher_class_assignments
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "teachers read own class assignments"
on public.teacher_class_assignments
for select
to authenticated
using (
  public.current_role() = 'teacher'
  and teacher_id = (
    select teacher_id from public.profiles where id = auth.uid()
  )
);

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
  public.current_role() = 'admin'
  or (
    public.current_role() = 'teacher'
    and class_id = any(public.current_teacher_class_ids())
  )
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
  public.current_role() = 'admin'
  or (
    public.current_role() = 'teacher'
    and subject_id = public.current_teacher_subject_id()
    and exists (
      select 1
      from public.students s
      where s.student_id = public.marks.student_id
        and s.class_id = any(public.current_teacher_class_ids())
    )
  )
  or student_id = (
    select student_id from public.profiles where id = auth.uid()
  )
);

create policy "teachers manage marks"
on public.marks
for insert
to authenticated
with check (
  public.current_role() = 'teacher'
  and subject_id = public.current_teacher_subject_id()
  and exists (
    select 1
    from public.students s
    where s.student_id = public.marks.student_id
      and s.class_id = any(public.current_teacher_class_ids())
  )
);

create policy "teachers update marks"
on public.marks
for update
to authenticated
using (
  public.current_role() = 'teacher'
  and subject_id = public.current_teacher_subject_id()
  and exists (
    select 1
    from public.students s
    where s.student_id = public.marks.student_id
      and s.class_id = any(public.current_teacher_class_ids())
  )
)
with check (
  public.current_role() = 'teacher'
  and subject_id = public.current_teacher_subject_id()
  and exists (
    select 1
    from public.students s
    where s.student_id = public.marks.student_id
      and s.class_id = any(public.current_teacher_class_ids())
  )
);
