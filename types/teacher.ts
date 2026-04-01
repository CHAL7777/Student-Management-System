export interface Teacher {
  teacher_id: string;
  name: string;
  subject_id: string | null;
  class_ids?: string[];
  class_names?: string[];
  created_at?: string;
}

export interface TeacherClassAssignment {
  teacher_id: string;
  class_id: string;
  class_name?: string;
  created_at?: string;
}

export interface TeacherFormValues {
  teacher_id: string;
  name: string;
  subject_id: string;
  class_ids: string[];
  temporary_password: string;
}
