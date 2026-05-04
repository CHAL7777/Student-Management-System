-- Student Result System schema for Supabase.
-- This script is intentionally idempotent so it can be rerun during local setup.
-- Every database object definition below must guard against pre-existing objects using
-- IF NOT EXISTS, IF EXISTS, or CREATE OR REPLACE as appropriate.
--
-- Current application rules:
--   * marks are stored on a 0..100 scale
--   * pass/fail is derived with a fixed threshold of 50
--   * subject total_mark is treated as the subject-specific maximum allowed mark

create schema if not exists extensions;
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto" with schema extensions;

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

-- 1. Core tables

create table if not exists public.subjects (
  subject_id uuid primary key default uuid_generate_v4(),
  subject_name text not null unique,
  total_mark integer not null default 100 check (total_mark between 1 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  constraint subjects_subject_name_not_blank check (btrim(subject_name) <> '')
);

create table if not exists public.teachers (
  teacher_id text primary key,
  name text not null,
  subject_id uuid references public.subjects(subject_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint teachers_teacher_id_not_blank check (btrim(teacher_id) <> ''),
  constraint teachers_name_not_blank check (btrim(name) <> '')
);

create table if not exists public.classes (
  class_id uuid primary key default uuid_generate_v4(),
  class_name text not null unique,
  homeroom_teacher_id text references public.teachers(teacher_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint classes_class_name_not_blank check (btrim(class_name) <> '')
);

create table if not exists public.teacher_class_assignments (
  teacher_id text not null references public.teachers(teacher_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (teacher_id, class_id)
);

create table if not exists public.students (
  student_id text primary key,
  name text not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  grade text not null,
  academic_year text not null,
  semester text not null,
  class_id uuid references public.classes(class_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint students_student_id_not_blank check (btrim(student_id) <> ''),
  constraint students_name_not_blank check (btrim(name) <> ''),
  constraint students_grade_not_blank check (btrim(grade) <> ''),
  constraint students_academic_year_not_blank check (btrim(academic_year) <> ''),
  constraint students_semester_not_blank check (btrim(semester) <> '')
);

create table if not exists public.marks (
  student_id text not null references public.students(student_id) on delete cascade,
  subject_id uuid not null references public.subjects(subject_id) on delete cascade,
  mark numeric(5,2) not null check (mark between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
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
  constraint profiles_full_name_not_blank check (btrim(full_name) <> ''),
  constraint profiles_login_id_not_blank check (login_id is null or btrim(login_id) <> ''),
  constraint profiles_role_link_check check (
    (role = 'student' and student_id is not null and teacher_id is null)
    or (role = 'teacher' and teacher_id is not null and student_id is null)
    or (role = 'admin' and student_id is null and teacher_id is null)
  )
);

create table if not exists public.audit_log (
  audit_id bigserial primary key,
  table_name text not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  record_pk jsonb not null default '{}'::jsonb,
  old_record jsonb,
  new_record jsonb,
  changed_at timestamptz not null default timezone('utc', now()),
  changed_by uuid
);

-- 2. Compatibility patches for older local databases

alter table public.teachers
add column if not exists subject_id uuid references public.subjects(subject_id) on delete set null;

alter table public.profiles
add column if not exists login_id text;

alter table public.marks
add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.students
alter column student_id drop default;

alter table public.teachers
alter column teacher_id drop default;

alter table public.teachers
drop column if exists department_id;

-- 3. Documentation comments

comment on table public.subjects is
'Curriculum master data. total_mark stores the maximum score allowed for marks recorded in that subject.';

comment on table public.teachers is
'Teacher master data keyed by the institution-specific teacher identifier.';

comment on table public.classes is
'Class master data including the optional homeroom teacher relationship.';

comment on table public.teacher_class_assignments is
'Association table that scopes which classes a teacher can work with.';

comment on table public.students is
'Student master data keyed by the institution-specific student identifier.';

comment on table public.marks is
'Transactional mark data. Each student-subject pair may have at most one stored mark.';

comment on table public.profiles is
'Application identity metadata that links an authenticated user to an academic role and record.';

comment on table public.audit_log is
'Append-only audit log for tracking inserts, updates, and deletes on core tables.';

comment on column public.subjects.total_mark is
'Maximum score allowed for the subject. The current application UI uses a 0-100 mark entry scale.';

comment on column public.classes.homeroom_teacher_id is
'Optional teacher responsible for class-level administration and reporting.';

comment on column public.students.academic_year is
'Free-form academic year label such as 2025/2026.';

comment on column public.students.semester is
'Free-form semester label such as Semester 1 or Semester 2.';

comment on column public.marks.mark is
'Score stored on the application''s current 0-100 scale and additionally validated against subjects.total_mark.';

comment on column public.marks.updated_at is
'Last time the mark row changed. Maintained automatically by trigger.';

comment on column public.profiles.login_id is
'Human-readable identifier used during login, such as ADM-001, TCH-101, or STD-001.';

-- 4. Supporting indexes

create unique index if not exists profiles_login_id_unique_idx
on public.profiles (lower(login_id))
where login_id is not null;

create index if not exists teachers_subject_id_idx
on public.teachers (subject_id);

create index if not exists classes_homeroom_teacher_id_idx
on public.classes (homeroom_teacher_id);

create index if not exists students_class_id_idx
on public.students (class_id);

create index if not exists marks_subject_id_student_id_idx
on public.marks (subject_id, student_id);

create index if not exists teacher_class_assignments_class_id_teacher_id_idx
on public.teacher_class_assignments (class_id, teacher_id);

create index if not exists audit_log_table_name_changed_at_idx
on public.audit_log (table_name, changed_at desc);

create index if not exists audit_log_changed_by_changed_at_idx
on public.audit_log (changed_by, changed_at desc);

create index if not exists audit_log_record_pk_gin_idx
on public.audit_log using gin (record_pk);

-- 5. Shared trigger functions

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.validate_mark_against_subject_total()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_total_mark integer;
begin
  select total_mark
  into v_total_mark
  from public.subjects
  where subject_id = new.subject_id;

  if v_total_mark is null then
    raise exception 'Subject % does not exist', new.subject_id;
  end if;

  if new.mark > v_total_mark then
    raise exception 'Mark % cannot exceed the subject total mark %', new.mark, v_total_mark;
  end if;

  return new;
end;
$$;

comment on function public.handle_updated_at() is
'Maintains updated_at columns on mutable rows before update.';

comment on function public.validate_mark_against_subject_total() is
'Rejects mark inserts or updates that exceed the configured subject total_mark.';

create or replace function public.audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pk_cols text[];
  v_pk jsonb := '{}'::jsonb;
  v_row jsonb;
  v_col text;
begin
  v_pk_cols := string_to_array(coalesce(TG_ARGV[0], ''), ',');
  v_row := case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end;

  foreach v_col in array v_pk_cols loop
    v_col := btrim(v_col);
    if v_col <> '' then
      v_pk := v_pk || jsonb_build_object(v_col, v_row -> v_col);
    end if;
  end loop;

  insert into public.audit_log (
    table_name,
    operation,
    record_pk,
    old_record,
    new_record,
    changed_by
  ) values (
    TG_TABLE_NAME,
    TG_OP,
    v_pk,
    case when TG_OP in ('UPDATE', 'DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then to_jsonb(NEW) else null end,
    auth.uid()
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;

  return NEW;
end;
$$;

comment on function public.audit_row_changes() is
'Captures row-level changes in audit_log using primary key columns supplied via trigger arguments.';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists set_marks_updated_at on public.marks;
create trigger set_marks_updated_at
before update on public.marks
for each row
execute function public.handle_updated_at();

drop trigger if exists validate_marks_against_subject_total on public.marks;
create trigger validate_marks_against_subject_total
before insert or update on public.marks
for each row
execute function public.validate_mark_against_subject_total();

drop trigger if exists audit_subjects_changes on public.subjects;
create trigger audit_subjects_changes
after insert or update or delete on public.subjects
for each row
execute function public.audit_row_changes('subject_id');

drop trigger if exists audit_teachers_changes on public.teachers;
create trigger audit_teachers_changes
after insert or update or delete on public.teachers
for each row
execute function public.audit_row_changes('teacher_id');

drop trigger if exists audit_classes_changes on public.classes;
create trigger audit_classes_changes
after insert or update or delete on public.classes
for each row
execute function public.audit_row_changes('class_id');

drop trigger if exists audit_teacher_class_assignments_changes on public.teacher_class_assignments;
create trigger audit_teacher_class_assignments_changes
after insert or update or delete on public.teacher_class_assignments
for each row
execute function public.audit_row_changes('teacher_id,class_id');

drop trigger if exists audit_students_changes on public.students;
create trigger audit_students_changes
after insert or update or delete on public.students
for each row
execute function public.audit_row_changes('student_id');

drop trigger if exists audit_marks_changes on public.marks;
create trigger audit_marks_changes
after insert or update or delete on public.marks
for each row
execute function public.audit_row_changes('student_id,subject_id');

drop trigger if exists audit_profiles_changes on public.profiles;
create trigger audit_profiles_changes
after insert or update or delete on public.profiles
for each row
execute function public.audit_row_changes('id');

-- 6. Reporting views

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
  sub.total_mark as subject_total_mark,
  coalesce(m.mark, 0)::numeric(5,2) as mark,
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
  coalesce(sum(coalesce(m.mark, 0)), 0)::numeric(10,2) as total,
  coalesce(avg(coalesce(m.mark, 0)), 0)::numeric(5,2) as average,
  rank() over (order by coalesce(sum(coalesce(m.mark, 0)), 0) desc) as rank
from public.students s
left join public.classes c on c.class_id = s.class_id
left join public.subjects sub on true
left join public.marks m
  on m.student_id = s.student_id
 and m.subject_id = sub.subject_id
group by s.student_id, s.name, s.grade, s.academic_year, s.semester, c.class_name;

alter view public.student_subject_report set (security_invoker = true);
alter view public.student_report_summary set (security_invoker = true);

comment on view public.student_subject_report is
'Derived student-by-subject matrix. Missing marks are surfaced as 0 so report output stays rectangular.';

comment on view public.student_report_summary is
'Derived totals, averages, and rank per student using the same zero-fill reporting semantics as the subject matrix.';

-- 6b. Grading helpers

create or replace function public.calculate_letter_grade(
  p_mark numeric,
  p_total_mark integer default 100
)
returns text
language plpgsql
immutable
as $$
declare
  v_percent numeric;
begin
  if p_total_mark is null or p_total_mark <= 0 then
    return null;
  end if;

  v_percent := (p_mark / p_total_mark) * 100;

  if v_percent >= 90 then
    return 'A';
  elsif v_percent >= 80 then
    return 'B';
  elsif v_percent >= 70 then
    return 'C';
  elsif v_percent >= 60 then
    return 'D';
  elsif v_percent >= 50 then
    return 'E';
  end if;

  return 'F';
end;
$$;

create or replace function public.calculate_gpa(
  p_mark numeric,
  p_total_mark integer default 100
)
returns numeric(3,2)
language sql
immutable
as $$
  select case
    when p_total_mark is null or p_total_mark <= 0 then null
    else round(least(greatest((p_mark / p_total_mark) * 4.0, 0), 4), 2)
  end
$$;

create or replace function public.calculate_student_result(p_student_id text)
returns table (
  student_id text,
  total numeric(10,2),
  average numeric(5,2),
  rank integer,
  overall_status text
)
language sql
stable
as $$
  select
    s.student_id,
    s.total,
    s.average,
    s.rank,
    case when s.average >= 50 then 'Pass' else 'Fail' end as overall_status
  from public.student_report_summary s
  where s.student_id = p_student_id
$$;

comment on function public.calculate_letter_grade(numeric, integer) is
'Maps a mark percentage to a letter grade using the default thresholds A=90, B=80, C=70, D=60, E=50.';

comment on function public.calculate_gpa(numeric, integer) is
'Converts a mark percentage to a 0-4 GPA scale using a linear mapping.';

comment on function public.calculate_student_result(text) is
'Returns the derived total, average, rank, and overall status for a single student using reporting views.';

-- 7. RLS helper functions

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_teacher_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select teacher_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_student_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select student_id
  from public.profiles
  where id = auth.uid()
$$;

create or replace function public.current_teacher_subject_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select subject_id
  from public.teachers
  where teacher_id = public.current_teacher_id()
$$;

create or replace function public.current_teacher_class_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(class_id order by class_id), array[]::uuid[])
  from public.teacher_class_assignments
  where teacher_id = public.current_teacher_id()
$$;

comment on function public.current_role() is
'Returns the current authenticated profile role for RLS and trusted server-side helpers.';

comment on function public.current_teacher_subject_id() is
'Returns the current teacher''s assigned subject for mark-entry authorization.';

comment on function public.current_teacher_class_ids() is
'Returns the current teacher''s assigned class IDs for scoped reads and writes.';

-- 8. Authentication and account helpers

create or replace function public.resolve_login_email(p_full_name text, p_login_id text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resolved_email text;
begin
  if coalesce(length(trim(p_full_name)), 0) = 0 or coalesce(length(trim(p_login_id)), 0) = 0 then
    return null;
  end if;

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

comment on function public.resolve_login_email(text, text) is
'Maps the visible full-name/login-id pair used on the login screen to the hidden auth email.';

comment on function public.change_own_password(text, text) is
'Changes the authenticated user''s password after verifying the current password.';

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
  v_full_name text;
  v_grade text;
  v_academic_year text;
  v_semester text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create student accounts';
  end if;

  v_login_id := trim(p_student_id);
  v_full_name := trim(p_full_name);
  v_grade := trim(p_grade);
  v_academic_year := trim(p_academic_year);
  v_semester := trim(p_semester);
  v_hidden_email := public.build_hidden_login_email('student', v_login_id);
  v_user_id := uuid_generate_v4();

  if v_login_id = '' then
    raise exception 'Student ID is required';
  end if;

  if v_full_name = '' then
    raise exception 'Student name is required';
  end if;

  if p_gender not in ('male', 'female', 'other') then
    raise exception 'Gender must be one of male, female, or other';
  end if;

  if v_grade = '' then
    raise exception 'Grade is required';
  end if;

  if v_academic_year = '' then
    raise exception 'Academic year is required';
  end if;

  if v_semester = '' then
    raise exception 'Semester is required';
  end if;

  if coalesce(length(p_password), 0) < 6 then
    raise exception 'Temporary password must be at least 6 characters';
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
    v_full_name,
    p_gender,
    v_grade,
    v_academic_year,
    v_semester,
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
    jsonb_build_object('full_name', v_full_name, 'login_id', v_login_id),
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
    uuid_generate_v4(),
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
    v_full_name,
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
  v_full_name text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'Only admins can create teacher accounts';
  end if;

  v_login_id := trim(p_teacher_id);
  v_full_name := trim(p_full_name);
  v_hidden_email := public.build_hidden_login_email('teacher', v_login_id);
  v_user_id := uuid_generate_v4();

  if v_login_id = '' then
    raise exception 'Teacher ID is required';
  end if;

  if v_full_name = '' then
    raise exception 'Teacher name is required';
  end if;

  if p_subject_id is null then
    raise exception 'Subject is required';
  end if;

  if coalesce(length(p_password), 0) < 6 then
    raise exception 'Temporary password must be at least 6 characters';
  end if;

  if coalesce(array_length(array_remove(coalesce(p_class_ids, array[]::uuid[]), null), 1), 0) = 0 then
    raise exception 'Assign at least one class to the teacher';
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
    v_full_name,
    p_subject_id
  );

  insert into public.teacher_class_assignments (teacher_id, class_id)
  select
    v_login_id,
    assigned_classes.class_id
  from (
    select distinct class_id
    from unnest(coalesce(p_class_ids, array[]::uuid[])) as assigned_class(class_id)
    where class_id is not null
  ) as assigned_classes;

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
    jsonb_build_object('full_name', v_full_name, 'login_id', v_login_id),
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
    uuid_generate_v4(),
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
    v_full_name,
    v_login_id,
    'teacher',
    null,
    v_login_id
  );

  return v_login_id;
end;
$$;

comment on function public.create_student_with_account(text, text, text, text, text, text, uuid, text) is
'Creates a student row, auth user, auth identity, and linked profile in one protected transaction.';

comment on function public.create_teacher_with_account(text, text, uuid, text, uuid[]) is
'Creates a teacher row, class assignments, auth user, auth identity, and linked profile in one protected transaction.';

drop procedure if exists public.create_student_account(text, text, text, text, text, text, uuid, text);

create procedure public.create_student_account(
  p_student_id text,
  p_full_name text,
  p_gender text,
  p_grade text,
  p_academic_year text,
  p_semester text,
  p_class_id uuid,
  p_password text
)
language plpgsql
as $$
begin
  perform public.create_student_with_account(
    p_student_id,
    p_full_name,
    p_gender,
    p_grade,
    p_academic_year,
    p_semester,
    p_class_id,
    p_password
  );
end;
$$;

drop procedure if exists public.create_teacher_account(text, text, uuid, text, uuid[]);

create procedure public.create_teacher_account(
  p_teacher_id text,
  p_full_name text,
  p_subject_id uuid,
  p_password text,
  p_class_ids uuid[]
)
language plpgsql
as $$
begin
  perform public.create_teacher_with_account(
    p_teacher_id,
    p_full_name,
    p_subject_id,
    p_password,
    p_class_ids
  );
end;
$$;

grant execute on function public.resolve_login_email(text, text) to anon, authenticated;
grant execute on function public.current_teacher_subject_id() to authenticated;
grant execute on function public.current_teacher_class_ids() to authenticated;
grant execute on function public.change_own_password(text, text) to authenticated;
grant execute on function public.create_student_with_account(text, text, text, text, text, text, uuid, text) to authenticated;
grant execute on function public.create_teacher_with_account(text, text, uuid, text, uuid[]) to authenticated;
grant execute on function public.calculate_letter_grade(numeric, integer) to authenticated;
grant execute on function public.calculate_gpa(numeric, integer) to authenticated;
grant execute on function public.calculate_student_result(text) to authenticated;
grant execute on procedure public.create_student_account(text, text, text, text, text, text, uuid, text) to authenticated;
grant execute on procedure public.create_teacher_account(text, text, uuid, text, uuid[]) to authenticated;

-- 9. Row-Level Security

alter table public.teachers enable row level security;
alter table public.teacher_class_assignments enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.marks enable row level security;
alter table public.profiles enable row level security;

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
  and teacher_id = public.current_teacher_id()
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
  or student_id = public.current_student_id()
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
  or student_id = public.current_student_id()
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
