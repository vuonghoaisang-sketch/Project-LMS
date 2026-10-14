import api from '@/lib/axios';
import { LessonAttachment } from '@/types/attachment';

export async function uploadImage(file: File): Promise<{
  success: boolean;
  url: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{
  success: boolean;
  url: string;
  size: number;
  duration?: number;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  return response.data;
}

export async function uploadAttachment(file: File): Promise<{
  success: boolean;
  attachment: {
    url: string;
    name: string;
    size: number;
    type: string;
  };
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload/attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function addLessonAttachment(
  lessonId: number,
  attachment: {
    name: string;
    file_url: string;
    file_size: number;
    file_type: string;
  },
): Promise<{ success: boolean; attachment: LessonAttachment }> {
  const response = await api.post(`/lessons/${lessonId}/attachments`, attachment);
  return response.data;
}

export async function deleteLessonAttachment(attachmentId: number) {
  const response = await api.delete(`/lessons/attachments/${attachmentId}`);
  return response.data;
}
