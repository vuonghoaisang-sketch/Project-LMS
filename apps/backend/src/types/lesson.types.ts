export interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  description?: string | null;
  video_url?: string | null;
  position: number;
  created_at?: string | Date;
}

export interface CreateLessonDTO {
  course_id: number;
  title: string;
  description?: string;
  video_url?: string;
  position: number;
}
