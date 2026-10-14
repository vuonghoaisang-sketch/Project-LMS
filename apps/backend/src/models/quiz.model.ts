import db from "../config/database";

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  type: "multiple_choice" | "true_false";
  explanation: string | null;
  position: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
  submitted_at?: string;
}

export async function findQuizByLesson(lessonId: number): Promise<Quiz | null> {
  const [rows] = await db.execute(
    "SELECT * FROM quizzes WHERE lesson_id = ? LIMIT 1",
    [lessonId],
  );
  return (rows as Quiz[])[0] ?? null;
}

export async function findQuizById(id: number): Promise<Quiz | null> {
  const [rows] = await db.execute("SELECT * FROM quizzes WHERE id = ? LIMIT 1", [
    id,
  ]);
  return (rows as Quiz[])[0] ?? null;
}

export async function createQuiz(data: {
  lesson_id: number;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  is_required: boolean;
}): Promise<Quiz> {
  const [result] = await db.execute(
    "INSERT INTO quizzes (lesson_id, title, description, time_limit_minutes, passing_score, is_required) VALUES (?, ?, ?, ?, ?, ?)",
    [
      data.lesson_id,
      data.title,
      data.description ?? null,
      data.time_limit_minutes,
      data.passing_score,
      data.is_required ? 1 : 0,
    ],
  );
  const id = (result as any).insertId;
  return (await findQuizById(id))!;
}

export async function updateQuiz(
  id: number,
  data: {
    title?: string;
    description?: string | null;
    time_limit_minutes?: number;
    passing_score?: number;
    is_required?: boolean;
  },
): Promise<void> {
  const existing = await findQuizById(id);
  if (!existing) return;
  await db.execute(
    "UPDATE quizzes SET title=?, description=?, time_limit_minutes=?, passing_score=?, is_required=? WHERE id=?",
    [
      data.title ?? existing.title,
      data.description !== undefined ? data.description : existing.description,
      data.time_limit_minutes ?? existing.time_limit_minutes,
      data.passing_score ?? existing.passing_score,
      data.is_required !== undefined
        ? data.is_required
          ? 1
          : 0
        : existing.is_required
          ? 1
          : 0,
      id,
    ],
  );
}

export async function deleteQuiz(id: number): Promise<void> {
  await db.execute("DELETE FROM quizzes WHERE id = ?", [id]);
}

export async function getQuizWithQuestions(
  quizId: number,
): Promise<(Quiz & { questions: QuizQuestion[] }) | null> {
  const quiz = await findQuizById(quizId);
  if (!quiz) return null;
  const [qRows] = await db.execute(
    "SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY position ASC",
    [quizId],
  );
  const questions = qRows as QuizQuestion[];
  for (const q of questions) {
    const [oRows] = await db.execute(
      "SELECT * FROM quiz_options WHERE question_id = ? ORDER BY position ASC",
      [q.id],
    );
    q.options = (oRows as any[]).map((opt) => ({
      ...opt,
      is_correct: Boolean(opt.is_correct),
    }));
  }
  return { ...quiz, questions };
}

export async function createQuestion(data: {
  quiz_id: number;
  question: string;
  type: "multiple_choice" | "true_false";
  explanation?: string;
  position: number;
}): Promise<QuizQuestion> {
  const [result] = await db.execute(
    "INSERT INTO quiz_questions (quiz_id, question, type, explanation, position) VALUES (?, ?, ?, ?, ?)",
    [
      data.quiz_id,
      data.question,
      data.type,
      data.explanation ?? null,
      data.position,
    ],
  );
  const id = (result as any).insertId;
  const [rows] = await db.execute(
    "SELECT * FROM quiz_questions WHERE id = ?",
    [id],
  );
  return (rows as QuizQuestion[])[0];
}

export async function createOption(data: {
  question_id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
}): Promise<QuizOption> {
  const [result] = await db.execute(
    "INSERT INTO quiz_options (question_id, option_text, is_correct, position) VALUES (?, ?, ?, ?)",
    [
      data.question_id,
      data.option_text,
      data.is_correct ? 1 : 0,
      data.position,
    ],
  );
  const id = (result as any).insertId;
  const [rows] = await db.execute("SELECT * FROM quiz_options WHERE id = ?", [
    id,
  ]);
  const row = (rows as any[])[0];
  return { ...row, is_correct: Boolean(row.is_correct) };
}

export async function deleteQuestionsForQuiz(quizId: number): Promise<void> {
  await db.execute("DELETE FROM quiz_questions WHERE quiz_id = ?", [quizId]);
}

export async function saveAttempt(data: {
  quiz_id: number;
  user_id: number;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number;
}): Promise<QuizAttempt> {
  const [result] = await db.execute(
    "INSERT INTO quiz_attempts (quiz_id, user_id, score, passed, total_questions, correct_answers, time_taken_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      data.quiz_id,
      data.user_id,
      data.score,
      data.passed ? 1 : 0,
      data.total_questions,
      data.correct_answers,
      data.time_taken_seconds,
    ],
  );
  const id = (result as any).insertId;
  const [rows] = await db.execute("SELECT * FROM quiz_attempts WHERE id = ?", [
    id,
  ]);
  const row = (rows as any[])[0];
  return { ...row, passed: Boolean(row.passed) };
}

export async function saveAttemptAnswers(
  attemptId: number,
  answers: Array<{
    question_id: number;
    selected_option_id: number | null;
    is_correct: boolean;
  }>,
): Promise<void> {
  for (const a of answers) {
    await db.execute(
      "INSERT INTO quiz_attempt_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES (?, ?, ?, ?)",
      [
        attemptId,
        a.question_id,
        a.selected_option_id ?? null,
        a.is_correct ? 1 : 0,
      ],
    );
  }
}

export async function getBestAttempt(
  quizId: number,
  userId: number,
): Promise<QuizAttempt | null> {
  const [rows] = await db.execute(
    "SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY score DESC, submitted_at DESC LIMIT 1",
    [quizId, userId],
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return { ...row, passed: Boolean(row.passed) };
}

export async function getAttemptsByUser(
  quizId: number,
  userId: number,
): Promise<QuizAttempt[]> {
  const [rows] = await db.execute(
    "SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY submitted_at DESC",
    [quizId, userId],
  );
  return (rows as any[]).map((r) => ({ ...r, passed: Boolean(r.passed) }));
}
