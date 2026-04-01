import { createServerSupabase } from "@/lib/supabase";
import type {
  ClassFormValues,
  ClassRoom,
  DashboardMetrics,
  Department,
  MarkFormValues,
  Student,
  StudentFormValues,
  StudentReportData,
  StudentReportSubject,
  StudentReportSummary,
  Subject,
  SubjectFormValues,
  Teacher,
  TeacherFormValues,
  UserProfile
} from "@/types";

function ensureNoError(error: { message: string } | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

async function getCount(table: string) {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  ensureNoError(error, `Failed to count ${table}`);
  return count ?? 0;
}

export async function listStudents() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("students")
    .select("student_id, name, gender, grade, academic_year, semester, class_id, created_at")
    .order("name");

  ensureNoError(error, "Failed to load students");
  return (data ?? []) as Student[];
}

export async function getStudentById(studentId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("students")
    .select("student_id, name, gender, grade, academic_year, semester, class_id, created_at")
    .eq("student_id", studentId)
    .single();

  ensureNoError(error, "Failed to load student");
  return data as Student;
}

export async function listTeachers() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("teachers")
    .select("teacher_id, name, department_id, created_at")
    .order("name");

  ensureNoError(error, "Failed to load teachers");
  return (data ?? []) as Teacher[];
}

export async function listDepartments() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("departments")
    .select("department_id, department_name, created_at")
    .order("department_name");

  ensureNoError(error, "Failed to load departments");
  return (data ?? []) as Department[];
}

export async function listClasses() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("classes")
    .select("class_id, class_name, homeroom_teacher_id, created_at")
    .order("class_name");

  ensureNoError(error, "Failed to load classes");
  return (data ?? []) as ClassRoom[];
}

export async function listSubjects() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select("subject_id, subject_name, total_mark, created_at")
    .order("subject_name");

  ensureNoError(error, "Failed to load subjects");
  return (data ?? []) as Subject[];
}

export async function createDepartment(departmentName: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("departments").insert({
    department_name: departmentName.trim()
  });

  ensureNoError(error, "Failed to create department");
}

export async function createSubject(values: SubjectFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("subjects").insert({
    subject_name: values.subject_name.trim(),
    total_mark: values.total_mark
  });

  ensureNoError(error, "Failed to create subject");
}

export async function createClass(values: ClassFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("classes").insert({
    class_name: values.class_name.trim(),
    homeroom_teacher_id: values.homeroom_teacher_id.trim() || null
  });

  ensureNoError(error, "Failed to create class");
}

export async function createStudent(values: StudentFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("create_student_with_account", {
    p_student_id: values.student_id.trim(),
    p_full_name: values.name.trim(),
    p_gender: values.gender,
    p_grade: values.grade.trim(),
    p_academic_year: values.academic_year.trim(),
    p_semester: values.semester.trim(),
    p_class_id: values.class_id.trim() || null,
    p_password: values.temporary_password
  });

  ensureNoError(error, "Failed to create student");
}

export async function createTeacher(values: TeacherFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("create_teacher_with_account", {
    p_teacher_id: values.teacher_id.trim(),
    p_full_name: values.name.trim(),
    p_department_id: values.department_id,
    p_password: values.temporary_password
  });

  ensureNoError(error, "Failed to create teacher");
}

export async function upsertMark(values: MarkFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("marks").upsert(
    {
      student_id: values.student_id,
      subject_id: values.subject_id,
      mark: values.mark
    },
    {
      onConflict: "student_id,subject_id"
    }
  );

  ensureNoError(error, "Failed to save mark");
}

export async function listVisibleReports(profile: UserProfile) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("student_report_summary")
    .select("student_id, student_name, grade, academic_year, semester, class_name, total, average, rank")
    .order("rank", { ascending: true });

  if (profile.role === "student" && profile.student_id) {
    query = query.eq("student_id", profile.student_id);
  }

  const { data, error } = await query;
  ensureNoError(error, "Failed to load reports");

  return ((data ?? []) as StudentReportSummary[]).map((item) => ({
    ...item,
    total: Number(item.total),
    average: Number(item.average),
    rank: Number(item.rank)
  }));
}

export async function getStudentReport(studentId: string): Promise<StudentReportData> {
  const supabase = await createServerSupabase();
  const [{ data: summaries, error: summaryError }, { data: subjects, error: subjectsError }] =
    await Promise.all([
      supabase
        .from("student_report_summary")
        .select("student_id, student_name, grade, academic_year, semester, class_name, total, average, rank")
        .eq("student_id", studentId)
        .limit(1),
      supabase
        .from("student_subject_report")
        .select(
          "student_id, student_name, grade, academic_year, semester, class_name, subject_id, subject_name, mark, status"
        )
        .eq("student_id", studentId)
        .order("subject_name")
    ]);

  ensureNoError(summaryError, "Failed to load student report summary");
  ensureNoError(subjectsError, "Failed to load student report subjects");

  const summaryRow = summaries?.[0];
  if (!summaryRow) {
    throw new Error("Student report not found");
  }

  return {
    summary: {
      ...(summaryRow as StudentReportSummary),
      total: Number(summaryRow.total),
      average: Number(summaryRow.average),
      rank: Number(summaryRow.rank)
    },
    subjects: ((subjects ?? []) as StudentReportSubject[]).map((subject) => ({
      ...subject,
      mark: Number(subject.mark)
    }))
  };
}

export async function getDashboardMetrics(profile: UserProfile): Promise<DashboardMetrics> {
  const [totalStudents, totalTeachers, totalSubjects, totalClasses, totalMarks, report] = await Promise.all([
    getCount("students"),
    getCount("teachers"),
    getCount("subjects"),
    getCount("classes"),
    getCount("marks"),
    profile.role === "student" && profile.student_id ? getStudentReport(profile.student_id) : Promise.resolve(null)
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalSubjects,
    totalClasses,
    totalMarks,
    report
  };
}
