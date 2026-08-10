export interface Enrollment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  enrolled_at: string;
}
