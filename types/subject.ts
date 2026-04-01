export interface Subject {
  subject_id: string;
  subject_name: string;
  total_mark: number;
  created_at?: string;
}

export interface SubjectFormValues {
  subject_name: string;
  total_mark: number;
}
