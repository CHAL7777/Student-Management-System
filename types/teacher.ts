export interface Department {
  department_id: string;
  department_name: string;
  created_at?: string;
}

export interface Teacher {
  teacher_id: string;
  name: string;
  department_id: string;
  created_at?: string;
}

export interface TeacherFormValues {
  teacher_id: string;
  name: string;
  department_id: string;
  temporary_password: string;
}
