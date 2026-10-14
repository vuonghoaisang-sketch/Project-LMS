import {
  findQuizByLesson,
  findQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizWithQuestions,
  deleteQuestionsForQuiz,
  createQuestion,
  createOption,
  saveAttempt,
  saveAttemptAnswers,
  getBestAttempt,
  getAttemptsByUser,
} from "../models/quiz.model";
import AppError from "../utils/AppError";

export async function getQuizForLesson(lessonId: number) {
  return findQuizByLesson(lessonId);
}

export async function getQuizDetailsForInstructor(quizId: number) {
  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) throw new AppError("Quiz not found", 404);
  return quiz;
}

export async function getQuizForStudent(quizId: number) {
  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) throw new AppError("Quiz not found", 404);
  // Strip correct answers from options before sending to student
  const sanitized = {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question: q.question,
      type: q.type,
      position: q.position,
      options:
        q.options?.map((o) => ({
          id: o.id,
          question_id: o.question_id,
          option_text: o.option_text,
          position: o.position,
        })) ?? [],
    })),
  };
  return sanitized;
}

export async function createQuizForLesson(
  lessonId: number,
  data: {
    title: string;
    description?: string;
    time_limit_minutes: number;
    passing_score: number;
    is_required: boolean;
    questions: Array<{
      question: string;
      type: "multiple_choice" | "true_false";
      explanation?: string;
      options: Array<{ option_text: string; is_correct: boolean }>;
    }>;
  },
) {
  const existing = await findQuizByLesson(lessonId);
  if (existing) {
    throw new AppError(
      "This lesson already has a quiz. Delete it first to recreate.",
      409,
    );
  }

  const quiz = await createQuiz({
    lesson_id: lessonId,
    title: data.title,
    description: data.description,
    time_limit_minutes: data.time_limit_minutes,
    passing_score: data.passing_score,
    is_required: data.is_required,
  });

  for (let qi = 0; qi < data.questions.length; qi++) {
    const qData = data.questions[qi];
    const question = await createQuestion({
      quiz_id: quiz.id,
      question: qData.question,
      type: qData.type,
      explanation: qData.explanation,
      position: qi + 1,
    });
    for (let oi = 0; oi < qData.options.length; oi++) {
      await createOption({
        question_id: question.id,
        option_text: qData.options[oi].option_text,
        is_correct: qData.options[oi].is_correct,
        position: oi + 1,
      });
    }
  }

  return getQuizDetailsForInstructor(quiz.id);
}

export async function updateQuizService(
  quizId: number,
  data: {
    title: string;
    description?: string;
    time_limit_minutes: number;
    passing_score: number;
    is_required: boolean;
    questions: Array<{
      question: string;
      type: "multiple_choice" | "true_false";
      explanation?: string;
      options: Array<{ option_text: string; is_correct: boolean }>;
    }>;
  },
) {
  const quiz = await findQuizById(quizId);
  if (!quiz) throw new AppError("Quiz not found", 404);

  await updateQuiz(quizId, {
    title: data.title,
    description: data.description,
    time_limit_minutes: data.time_limit_minutes,
    passing_score: data.passing_score,
    is_required: data.is_required,
  });

  // Replace all questions
  await deleteQuestionsForQuiz(quizId);
  for (let qi = 0; qi < data.questions.length; qi++) {
    const qData = data.questions[qi];
    const question = await createQuestion({
      quiz_id: quizId,
      question: qData.question,
      type: qData.type,
      explanation: qData.explanation,
      position: qi + 1,
    });
    for (let oi = 0; oi < qData.options.length; oi++) {
      await createOption({
        question_id: question.id,
        option_text: qData.options[oi].option_text,
        is_correct: qData.options[oi].is_correct,
        position: oi + 1,
      });
    }
  }

  return getQuizDetailsForInstructor(quizId);
}

export async function deleteQuizService(quizId: number) {
  const quiz = await findQuizById(quizId);
  if (!quiz) throw new AppError("Quiz not found", 404);
  await deleteQuiz(quizId);
}

export async function submitQuizAttempt(
  quizId: number,
  userId: number,
  answers: Array<{ question_id: number; selected_option_id: number | null }>,
  timeTakenSeconds: number,
) {
  const quizFull = await getQuizWithQuestions(quizId);
  if (!quizFull) throw new AppError("Quiz not found", 404);

  const graded: Array<{
    question_id: number;
    selected_option_id: number | null;
    is_correct: boolean;
    explanation: string | null;
    correct_option_id: number | null;
  }> = [];
  let correctCount = 0;

  for (const q of quizFull.questions) {
    const correctOption = q.options?.find((o) => o.is_correct);
    const userAnswer = answers.find((a) => a.question_id === q.id);
    const selectedOptionId = userAnswer?.selected_option_id ?? null;
    const isCorrect =
      selectedOptionId !== null && correctOption?.id === selectedOptionId;
    if (isCorrect) correctCount++;
    graded.push({
      question_id: q.id,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      explanation: q.explanation,
      correct_option_id: correctOption?.id ?? null,
    });
  }

  const totalQuestions = quizFull.questions.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100 * 100) / 100
      : 0;
  const passed = score >= quizFull.passing_score;

  const attempt = await saveAttempt({
    quiz_id: quizId,
    user_id: userId,
    score,
    passed,
    total_questions: totalQuestions,
    correct_answers: correctCount,
    time_taken_seconds: timeTakenSeconds,
  });

  await saveAttemptAnswers(
    attempt.id,
    graded.map((g) => ({
      question_id: g.question_id,
      selected_option_id: g.selected_option_id,
      is_correct: g.is_correct,
    })),
  );

  return { attempt, graded, passed, score };
}

export async function getMyBestAttempt(quizId: number, userId: number) {
  return getBestAttempt(quizId, userId);
}

export async function getMyAttempts(quizId: number, userId: number) {
  return getAttemptsByUser(quizId, userId);
}
