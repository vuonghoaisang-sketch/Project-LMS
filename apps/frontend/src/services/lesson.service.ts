import api from '@/lib/axios';

export async function getLessonsByCourse(courseId: number) {
  const response = await api.get(`/courses/${courseId}/lessons`);

  return response.data;
}

export async function getLessonById(id: number) {
  const response = await api.get(`/lessons/${id}`);

  return response.data;
}

export async function createLesson(
  courseId: number,
  data: {
    title: string;
    description: string;
    video_url: string;
    position: number;
  },
) {
  const token = localStorage.getItem('token');

  const response = await api.post(`/courses/${courseId}/lessons`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateLesson(
  id: number,
  data: {
    title: string;
    description: string;
    video_url: string;
    position: number;
  },
) {
  const token = localStorage.getItem('token');

  const response = await api.put(`/lessons/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteLesson(id: number) {
  const token = localStorage.getItem('token');

  const response = await api.delete(`/lessons/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
