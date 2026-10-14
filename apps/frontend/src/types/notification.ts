export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  reference_id: number | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}
