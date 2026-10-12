import api from '@/lib/axios';

export async function getCourses() {
  const response = await api.get('/courses');
  return response.data.courses;
}

export async function createCourse(data: {
  title: string;
  description: string;
  category: string;
  price: number;
}) {
  const response = await api.post('/courses', data);
  return response.data;
}

export async function getCourseById(id: number) {
  const response = await api.get(`/courses/${id}`);
  return response.data.course;
}

export async function updateCourse(
  id: number,
  data: {
    title: string;
    description: string;
    category: string;
    price: number;
  },
) {
  const response = await api.put(`/courses/${id}`, data);
  return response.data;
}

export async function deleteCourse(id: number) {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
}
