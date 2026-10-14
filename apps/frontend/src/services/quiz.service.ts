import api from '@/lib/axios';
import { Quiz, QuizAttempt, QuizSubmitResult } from '@/types/quiz';

export async function getLessonQuiz(lessonId: number): Promise<Quiz | null> {
  const response = await api.get(`/lessons/${lessonId}/quiz`);
  return response.data.quiz;
}

export async function getQuizForStudent(quizId: number): Promise<Quiz> {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.quiz;
}

export async function getQuizForInstructor(quizId: number): Promise<Quiz> {
  const response = await api.get(`/quizzes/${quizId}/manage`);
  return response.data.quiz;
}

export async function createQuiz(
  lessonId: number,
  data: {
    title: string;
    description?: string;
    time_limit_minutes: number;
    passing_score: number;
    is_required: boolean;
    questions: Array<{
      question: string;
      type: 'multiple_choice' | 'true_false';
      explanation?: string;
      options: Array<{ option_text: string; is_correct: boolean }>;
    }>;
  },
): Promise<Quiz> {
  const response = await api.post(`/lessons/${lessonId}/quiz`, data);
  return response.data.quiz;
}

export async function updateQuiz(
  quizId: number,
  data: {
    title: string;
    description?: string;
    time_limit_minutes: number;
    passing_score: number;
    is_required: boolean;
    questions: Array<{
      question: string;
      type: 'multiple_choice' | 'true_false';
      explanation?: string;
      options: Array<{ option_text: string; is_correct: boolean }>;
    }>;
  },
): Promise<Quiz> {
  const response = await api.put(`/quizzes/${quizId}`, data);
  return response.data.quiz;
}

export async function deleteQuiz(quizId: number): Promise<void> {
  await api.delete(`/quizzes/${quizId}`);
}

export async function submitQuiz(
  quizId: number,
  answers: Array<{ question_id: number; selected_option_id: number | null }>,
  timeTakenSeconds: number,
): Promise<QuizSubmitResult> {
  const response = await api.post(`/quizzes/${quizId}/submit`, {
    answers,
    time_taken_seconds: timeTakenSeconds,
  });
  return response.data;
}

export async function getMyBestAttempt(
  quizId: number,
): Promise<QuizAttempt | null> {
  const response = await api.get(`/quizzes/${quizId}/my-attempt`);
  return response.data.attempt;
}

export async function getMyAttempts(quizId: number): Promise<QuizAttempt[]> {
  const response = await api.get(`/quizzes/${quizId}/my-attempts`);
  return response.data.attempts;
}
