export interface Course {
  id: number;

  title: string;

  description: string;

  thumbnail: string | null;

  price: string;

  created_at: string;

  instructor_id: number;

  instructor_name: string;
}
