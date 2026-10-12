import api from '@/lib/axios';

export async function enrollCourse(courseId: number) {
  const response = await api.post('/enrollments', {
    course_id: courseId,
  });

  return response.data;
}

export async function getMyEnrollments() {
  const response = await api.get('/enrollments/my');
  return response.data;
}

export async function checkEnrollment(courseId: number) {
  const response = await api.get(`/enrollments/check/${courseId}`);
  return response.data;
}
