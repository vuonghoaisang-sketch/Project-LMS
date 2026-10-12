export interface Course {
  id?: number;
  title: string;
  description?: string | null;
  category?: string;
  thumbnail?: string | null;
  price?: number;
  created_by?: number | null;
  created_at?: string | Date;
  instructor_name?: string;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  category?: string;
  price: number;
  created_by: number;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
}
