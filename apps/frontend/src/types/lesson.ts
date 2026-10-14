import { LessonAttachment } from "./attachment";

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  video_type?: "embed" | "upload";
  video_url: string | null;
  position: number;
  attachments?: LessonAttachment[];
}
