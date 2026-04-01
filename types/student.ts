export type Gender = "male" | "female" | "other";

export interface Student {
  student_id: string;
  name: string;
  gender: Gender;
  grade: string;
  academic_year: string;
  semester: string;
  class_id: string | null;
  created_at?: string;
}

export interface StudentFormValues {
  student_id: string;
  name: string;
  gender: Gender;
  grade: string;
  academic_year: string;
  semester: string;
  class_id: string;
  temporary_password: string;
}
