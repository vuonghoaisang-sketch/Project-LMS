import api from '@/lib/axios';

export async function enrollCourse(courseId: number) {
  const token = localStorage.getItem('token');

  const response = await api.post(
    '/enrollments',
    {
      course_id: courseId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function getMyEnrollments() {
  const token = localStorage.getItem('token');

  const response = await api.get('/enrollments/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function checkEnrollment(courseId: number) {
  const token = localStorage.getItem('token');
  const response = await api.get(`/enrollments/check/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
