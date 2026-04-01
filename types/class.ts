export interface ClassRoom {
  class_id: string;
  class_name: string;
  homeroom_teacher_id: string | null;
  created_at?: string;
}

export interface ClassFormValues {
  class_name: string;
  homeroom_teacher_id: string;
}
