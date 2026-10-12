export interface Enrollment {
  id?: number;
  user_id: number;
  course_id: number;
  enrolled_at?: string | Date;
}
