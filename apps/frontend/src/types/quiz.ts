export interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct?: boolean;
  position: number;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  type: 'multiple_choice' | 'true_false';
  explanation?: string | null;
  position: number;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  is_required: boolean;
  questions?: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
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

export interface QuizSubmitResult {
  success: boolean;
  attempt: QuizAttempt;
  passed: boolean;
  score: number;
  graded: Array<{
    question_id: number;
    selected_option_id: number | null;
    is_correct: boolean;
    explanation: string | null;
    correct_option_id: number | null;
  }>;
}
