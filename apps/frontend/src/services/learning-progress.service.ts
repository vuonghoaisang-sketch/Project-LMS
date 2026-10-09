import api from '@/lib/axios';
import { CourseProgress } from '@/types/learning-progress';

export async function getCourseProgress(courseId: number) {
  const response = await api.get<{ progress: CourseProgress }>(
    `/courses/${courseId}/progress`,
  );
  return response.data.progress;
}

export async function completeLesson(lessonId: number) {
  const response = await api.post(`/lessons/${lessonId}/complete`);
  return response.data.completion;
}
