import api from '@/lib/axios';
import { Notification } from '@/types/notification';

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get('/notifications');
  return response.data.notifications;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get('/notifications/unread-count');
  return response.data.count;
}

export async function markNotificationsAsRead(): Promise<void> {
  await api.patch('/notifications/mark-read');
}
