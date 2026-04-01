export interface Mark {
  student_id: string;
  subject_id: string;
  mark: number;
  created_at?: string;
}

export interface MarkFormValues {
  student_id: string;
  subject_id: string;
  mark: number;
}
