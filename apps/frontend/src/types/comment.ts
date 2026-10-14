export interface Comment {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string | null;
  replies?: Comment[];
}
