import { LessonAttachment } from "./attachment.types";

export interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  description?: string | null;
  video_type?: "embed" | "upload";
  video_url?: string | null;
  position: number;
  attachments?: LessonAttachment[];
  created_at?: string | Date;
}

export interface CreateLessonDTO {
  course_id: number;
  title: string;
  description?: string;
  video_type?: "embed" | "upload";
  video_url?: string;
  position: number;
}
