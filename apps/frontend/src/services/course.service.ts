import api from '@/lib/axios';

export async function getCourses() {
  const response = await api.get('/courses');
  return response.data;
}

export async function createCourse(data: {
  title: string;
  description: string;
  price: number;
}) {
  const token = localStorage.getItem('token');
  const response = await api.post('/courses', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
export async function getCourseById(id: number) {
  const response = await api.get(`/courses/${id}`);
  return response.data;
}

export async function updateCourse(
  id: number,
  data: {
    title: string;
    description: string;
    price: number;
  },
) {
  const token = localStorage.getItem('token');
  const response = await api.put(`/courses/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function deleteCourse(id: number) {
  const token = localStorage.getItem('token');
  const response = await api.delete(`/courses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
