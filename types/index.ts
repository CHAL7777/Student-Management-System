export type { ClassFormValues, ClassRoom } from "./class";
export type { Gender, Student, StudentFormValues } from "./student";
export type { Teacher, TeacherClassAssignment, TeacherFormValues } from "./teacher";
export type { Subject, SubjectFormValues } from "./subject";
export type { Mark, MarkFormValues } from "./mark";

export type Role = "admin" | "teacher" | "student";

export interface UserProfile {
  id: string;
  full_name: string;
  login_id?: string | null;
  role: Role;
  student_id: string | null;
  teacher_id: string | null;
}

export interface StudentReportSummary {
  student_id: string;
  student_name: string;
  grade: string;
  academic_year: string;
  semester: string;
  class_name: string | null;
  total: number;
  average: number;
  rank: number;
}

export interface StudentReportSubject {
  student_id: string;
  student_name: string;
  grade: string;
  academic_year: string;
  semester: string;
  class_name: string | null;
  subject_id: string;
  subject_name: string;
  mark: number;
  status: "Pass" | "Fail";
}

export interface StudentReportData {
  summary: StudentReportSummary;
  subjects: StudentReportSubject[];
}

export interface HomeroomReportSubjectColumn {
  subject_id: string;
  subject_name: string;
}

export interface HomeroomReportRow {
  student_id: string;
  student_name: string;
  gender: string;
  grade: string;
  academic_year: string;
  semester: string;
  class_name: string | null;
  marks: Record<
    string,
    {
      subject_id: string;
      subject_name: string;
      mark: number;
      status: "Pass" | "Fail";
    }
  >;
  total: number;
  average: number;
  rank: number;
  overall_status: "Pass" | "Fail";
}

export interface HomeroomReportData {
  subjects: HomeroomReportSubjectColumn[];
  rows: HomeroomReportRow[];
}

export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalMarks: number;
  report: StudentReportData | null;
}
