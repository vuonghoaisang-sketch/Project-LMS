export interface Course {
  id: number;

  title: string;

  description: string;

  category: string;

  thumbnail: string | null;

  price: string;

  created_at: string;

  instructor_id: number;

  instructor_name: string;

  created_by?: number | null;
}
