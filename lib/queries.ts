import { createServerSupabase } from "@/lib/supabase";
import type {
  ClassFormValues,
  ClassRoom,
  DashboardMetrics,
  HomeroomReportData,
  HomeroomReportRow,
  MarkFormValues,
  Student,
  StudentFormValues,
  StudentReportData,
  StudentReportSubject,
  StudentReportSummary,
  Subject,
  SubjectFormValues,
  Teacher,
  TeacherClassAssignment,
  TeacherFormValues,
  UserProfile
} from "@/types";

function ensureNoError(
  error: { message: string; code?: string | null } | null,
  fallbackMessage: string
) {
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

export async function listStudents(profile?: UserProfile) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("students")
    .select("student_id, name, gender, grade, academic_year, semester, class_id, created_at")
    .order("name");

  if (profile?.role === "teacher") {
    const classIds = await getTeacherAssignedClassIds(profile);

    if (classIds.length === 0) {
      return [];
    }

    query = query.in("class_id", classIds);
  }

  const { data, error } = await query;
  ensureNoError(error, "Failed to load students");
  return (data ?? []) as Student[];
}

export async function getStudentById(studentId: string, profile?: UserProfile) {
  await assertProfileCanAccessStudent(studentId, profile);
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
    .select("teacher_id, name, subject_id, created_at")
    .order("name");

  ensureNoError(error, "Failed to load teachers");
  return (data ?? []) as Teacher[];
}

export async function listTeacherClassAssignments(teacherIds?: string[]) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("teacher_class_assignments")
    .select("teacher_id, class_id, created_at, classes(class_id, class_name)")
    .order("created_at");

  if (teacherIds && teacherIds.length > 0) {
    query = query.in("teacher_id", teacherIds);
  }

  const { data, error } = await query;
  ensureNoError(error, "Failed to load teacher class assignments");

  return ((data ?? []) as Array<{
    teacher_id: string;
    class_id: string;
    created_at?: string;
    classes?: Array<{ class_id: string; class_name: string }> | null;
  }>).map((row) => ({
    teacher_id: row.teacher_id,
    class_id: row.class_id,
    class_name: row.classes?.[0]?.class_name,
    created_at: row.created_at
  })) as TeacherClassAssignment[];
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

async function getTeacherAssignedSubjectId(profile: UserProfile) {
  if (profile.role !== "teacher" || !profile.teacher_id) {
    return null;
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("teachers")
    .select("subject_id")
    .eq("teacher_id", profile.teacher_id)
    .single();

  ensureNoError(error, "Failed to load assigned teacher subject");
  return (data?.subject_id as string | null) ?? null;
}

async function getTeacherAssignedClassIds(profile: UserProfile) {
  if (profile.role !== "teacher" || !profile.teacher_id) {
    return [] as string[];
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("teacher_class_assignments")
    .select("class_id")
    .eq("teacher_id", profile.teacher_id);

  ensureNoError(error, "Failed to load assigned teacher classes");
  return (data ?? []).map((item) => item.class_id as string);
}

export async function getTeacherAssignedClasses(profile: UserProfile) {
  const classIds = await getTeacherAssignedClassIds(profile);

  if (classIds.length === 0) {
    return [] as ClassRoom[];
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("classes")
    .select("class_id, class_name, homeroom_teacher_id, created_at")
    .in("class_id", classIds)
    .order("class_name");

  ensureNoError(error, "Failed to load assigned classes");
  return (data ?? []) as ClassRoom[];
}

async function getTeacherScopedStudentIds(profile: UserProfile) {
  const classIds = await getTeacherAssignedClassIds(profile);

  if (classIds.length === 0) {
    return [] as string[];
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("students").select("student_id").in("class_id", classIds);

  ensureNoError(error, "Failed to load teacher scoped students");
  return (data ?? []).map((student) => student.student_id as string);
}

async function assertProfileCanAccessStudent(studentId: string, profile?: UserProfile) {
  if (!profile) {
    return;
  }

  if (profile.role === "teacher") {
    const studentIds = await getTeacherScopedStudentIds(profile);

    if (!studentIds.includes(studentId)) {
      throw new Error("You can only access students in your assigned classes");
    }
  }

  if (profile.role === "student" && profile.student_id !== studentId) {
    throw new Error("You can only access your own report");
  }
}

export async function getTeacherAssignedSubject(profile: UserProfile) {
  const assignedSubjectId = await getTeacherAssignedSubjectId(profile);

  if (!assignedSubjectId) {
    return null;
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("subjects")
    .select("subject_id, subject_name, total_mark, created_at")
    .eq("subject_id", assignedSubjectId)
    .single();

  ensureNoError(error, "Failed to load assigned subject");
  return data as Subject;
}

export async function createSubject(values: SubjectFormValues) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("subjects").insert({
    subject_name: values.subject_name.trim(),
    total_mark: values.total_mark
  });

  ensureNoError(error, "Failed to create subject");
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("subjects").delete().eq("subject_id", subjectId);

  ensureNoError(error, "Failed to delete subject");
}

export async function createClass(values: ClassFormValues) {
  const supabase = await createServerSupabase();
  const className = values.class_name.trim();

  if (!className) {
    throw new Error("Class name is required");
  }

  const { data: existingClass, error: existingClassError } = await supabase
    .from("classes")
    .select("class_id")
    .ilike("class_name", className)
    .limit(1);

  ensureNoError(existingClassError, "Failed to validate class name");

  if (existingClass && existingClass.length > 0) {
    throw new Error("A class with this name already exists");
  }

  const { error } = await supabase.from("classes").insert({
    class_name: className,
    homeroom_teacher_id: values.homeroom_teacher_id.trim() || null
  });

  if (error?.code === "23505" || error?.message.toLowerCase().includes("classes_class_name_key")) {
    throw new Error("A class with this name already exists");
  }

  ensureNoError(error, "Failed to create class");
}

export async function updateClassHomeroomTeacher(classId: string, homeroomTeacherId: string | null) {
  if (!classId.trim()) {
    throw new Error("Class ID is required");
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("classes")
    .update({
      homeroom_teacher_id: homeroomTeacherId?.trim() ? homeroomTeacherId.trim() : null
    })
    .eq("class_id", classId.trim());

  ensureNoError(error, "Failed to update homeroom teacher");
}

export async function deleteClass(classId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("classes").delete().eq("class_id", classId);

  ensureNoError(error, "Failed to delete class");
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

export async function deleteStudent(studentId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("students").delete().eq("student_id", studentId);

  ensureNoError(error, "Failed to delete student");
}

export async function createTeacher(values: TeacherFormValues) {
  if (!values.subject_id.trim()) {
    throw new Error("Subject is required");
  }

  if (values.class_ids.length === 0) {
    throw new Error("Assign at least one class to the teacher");
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("create_teacher_with_account", {
    p_teacher_id: values.teacher_id.trim(),
    p_full_name: values.name.trim(),
    p_subject_id: values.subject_id,
    p_password: values.temporary_password,
    p_class_ids: values.class_ids.map((classId) => classId.trim()).filter(Boolean)
  });

  ensureNoError(error, "Failed to create teacher");
}

export async function deleteTeacher(teacherId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("teachers").delete().eq("teacher_id", teacherId);

  ensureNoError(error, "Failed to delete teacher");
}

export async function upsertMark(values: MarkFormValues, profile?: UserProfile) {
  if (profile?.role === "teacher") {
    const assignedSubjectId = await getTeacherAssignedSubjectId(profile);
    const allowedStudentIds = await getTeacherScopedStudentIds(profile);

    if (!assignedSubjectId) {
      throw new Error("You are not assigned to any subject yet");
    }

    if (allowedStudentIds.length === 0) {
      throw new Error("You are not assigned to any classes yet");
    }

    if (assignedSubjectId !== values.subject_id) {
      throw new Error("You can only enter marks for your assigned subject");
    }

    if (!allowedStudentIds.includes(values.student_id)) {
      throw new Error("You can only enter marks for students in your assigned classes");
    }
  }

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
  if (profile.role === "teacher") {
    const [studentIds, assignedSubjectId] = await Promise.all([
      getTeacherScopedStudentIds(profile),
      getTeacherAssignedSubjectId(profile)
    ]);

    if (studentIds.length === 0 || !assignedSubjectId) {
      return [] as StudentReportSummary[];
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("student_subject_report")
      .select("student_id, student_name, grade, academic_year, semester, class_name, mark")
      .eq("subject_id", assignedSubjectId)
      .in("student_id", studentIds)
      .order("mark", { ascending: false });

    ensureNoError(error, "Failed to load teacher scoped reports");

    const rows = (data ?? []) as Array<{
      student_id: string;
      student_name: string;
      grade: string;
      academic_year: string;
      semester: string;
      class_name: string | null;
      mark: number;
    }>;

    let lastMark: number | null = null;
    let lastRank = 0;

    return rows.map((row, index) => {
      const mark = Number(row.mark);
      const rank = lastMark === mark ? lastRank : index + 1;

      lastMark = mark;
      lastRank = rank;

      return {
        student_id: row.student_id,
        student_name: row.student_name,
        grade: row.grade,
        academic_year: row.academic_year,
        semester: row.semester,
        class_name: row.class_name,
        total: mark,
        average: mark,
        rank
      };
    });
  }

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

export async function getStudentReport(studentId: string, profile?: UserProfile): Promise<StudentReportData> {
  await assertProfileCanAccessStudent(studentId, profile);

  if (profile?.role === "teacher") {
    const assignedSubjectId = await getTeacherAssignedSubjectId(profile);

    if (!assignedSubjectId) {
      throw new Error("Teacher subject assignment not found");
    }

    const reports = await listVisibleReports(profile);
    const summary = reports.find((item) => item.student_id === studentId);

    if (!summary) {
      throw new Error("Student report not found");
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("student_subject_report")
      .select(
        "student_id, student_name, grade, academic_year, semester, class_name, subject_id, subject_name, mark, status"
      )
      .eq("student_id", studentId)
      .eq("subject_id", assignedSubjectId);

    ensureNoError(error, "Failed to load teacher subject report");

    return {
      summary,
      subjects: ((data ?? []) as StudentReportSubject[]).map((subject) => ({
        ...subject,
        mark: Number(subject.mark)
      }))
    };
  }

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

export async function getHomeroomReport(profile: UserProfile): Promise<HomeroomReportData> {
  const reports = await listVisibleReports(profile);

  if (reports.length === 0) {
    return {
      subjects: [],
      rows: []
    };
  }

  const studentIds = reports.map((report) => report.student_id);
  const assignedSubjectId =
    profile.role === "teacher" ? await getTeacherAssignedSubjectId(profile) : null;
  const supabase = await createServerSupabase();
  let subjectRowsQuery = supabase
    .from("student_subject_report")
    .select("student_id, subject_id, subject_name, mark, status")
    .in("student_id", studentIds)
    .order("subject_name");

  if (profile.role === "teacher" && assignedSubjectId) {
    subjectRowsQuery = subjectRowsQuery.eq("subject_id", assignedSubjectId);
  }

  const [{ data: students, error: studentsError }, { data: subjectRows, error: subjectRowsError }] =
    await Promise.all([
      supabase.from("students").select("student_id, gender").in("student_id", studentIds),
      subjectRowsQuery
    ]);

  ensureNoError(studentsError, "Failed to load report student data");
  ensureNoError(subjectRowsError, "Failed to load report subject matrix");

  const genderMap = new Map((students ?? []).map((student) => [student.student_id as string, student.gender as string]));
  const subjectMap = new Map<string, { subject_id: string; subject_name: string }>();
  const marksByStudent = new Map<
    string,
    HomeroomReportRow["marks"]
  >();

  for (const row of (subjectRows ?? []) as StudentReportSubject[]) {
    subjectMap.set(row.subject_id, {
      subject_id: row.subject_id,
      subject_name: row.subject_name
    });

    const currentMarks = marksByStudent.get(row.student_id) ?? {};
    currentMarks[row.subject_id] = {
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      mark: Number(row.mark),
      status: row.status
    };
    marksByStudent.set(row.student_id, currentMarks);
  }

  const rows: HomeroomReportRow[] = reports.map((report) => ({
    student_id: report.student_id,
    student_name: report.student_name,
    gender: genderMap.get(report.student_id) ?? "-",
    grade: report.grade,
    academic_year: report.academic_year,
    semester: report.semester,
    class_name: report.class_name,
    marks: marksByStudent.get(report.student_id) ?? {},
    total: report.total,
    average: report.average,
    rank: report.rank,
    overall_status: report.average >= 50 ? "Pass" : "Fail"
  }));

  return {
    subjects: Array.from(subjectMap.values()).sort((a, b) => a.subject_name.localeCompare(b.subject_name)),
    rows
  };
}

export async function getDashboardMetrics(profile: UserProfile): Promise<DashboardMetrics> {
  const [totalStudents, totalTeachers, totalSubjects, totalClasses, totalMarks, report] = await Promise.all([
    profile.role === "teacher" ? listStudents(profile).then((items) => items.length) : getCount("students"),
    getCount("teachers"),
    profile.role === "teacher"
      ? getTeacherAssignedSubject(profile).then((subject) => (subject ? 1 : 0))
      : getCount("subjects"),
    profile.role === "teacher"
      ? getTeacherAssignedClasses(profile).then((classes) => classes.length)
      : getCount("classes"),
    getCount("marks"),
    profile.role === "student" && profile.student_id ? getStudentReport(profile.student_id, profile) : Promise.resolve(null)
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
