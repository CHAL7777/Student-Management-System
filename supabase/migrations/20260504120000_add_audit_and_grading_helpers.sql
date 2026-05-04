-- Add audit logging, grading helpers, and procedure wrappers.

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

comment on table public.audit_log is
'Append-only audit log for tracking inserts, updates, and deletes on core tables.';

create index if not exists audit_log_table_name_changed_at_idx
on public.audit_log (table_name, changed_at desc);

create index if not exists audit_log_changed_by_changed_at_idx
on public.audit_log (changed_by, changed_at desc);

create index if not exists audit_log_record_pk_gin_idx
on public.audit_log using gin (record_pk);

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

grant execute on function public.calculate_letter_grade(numeric, integer) to authenticated;
grant execute on function public.calculate_gpa(numeric, integer) to authenticated;
grant execute on function public.calculate_student_result(text) to authenticated;
grant execute on procedure public.create_student_account(text, text, text, text, text, text, uuid, text) to authenticated;
grant execute on procedure public.create_teacher_account(text, text, uuid, text, uuid[]) to authenticated;
