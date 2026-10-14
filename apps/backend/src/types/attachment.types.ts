export interface LessonAttachment {
  id: number;
  lesson_id: number;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string | Date;
}
