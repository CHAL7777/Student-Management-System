-- Remove the legacy department column from teachers.
-- Teacher-to-subject assignment is modeled by teachers.subject_id.

alter table public.teachers
drop column if exists department_id;
