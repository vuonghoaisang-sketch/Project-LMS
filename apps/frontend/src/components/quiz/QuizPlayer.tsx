'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizSubmitResult, QuizAttempt } from '@/types/quiz';
import { submitQuiz, getMyBestAttempt } from '@/services/quiz.service';
import { getErrorMessage } from '@/utils/error';

interface QuizPlayerProps {
  quiz: Quiz;
  onPassed?: () => void;
}

export default function QuizPlayer({ quiz, onPassed }: QuizPlayerProps) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_minutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBest() {
      try {
        const attempt = await getMyBestAttempt(quiz.id);
        setBestAttempt(attempt);
        if (attempt?.passed && onPassed) {
          onPassed();
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadBest();
  }, [quiz.id, onPassed]);

  // Countdown timer
  useEffect(() => {
    if (!started || result || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, result, timeLeft]);

  function handleSelectOption(questionId: number, optionId: number) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleAutoSubmit() {
    await handleSubmit();
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const answersPayload = (quiz.questions || []).map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] ?? null,
      }));

      const timeTaken = quiz.time_limit_minutes * 60 - timeLeft;
      const res = await submitQuiz(quiz.id, answersPayload, Math.max(timeTaken, 1));
      setResult(res);

      if (res.passed) {
        setBestAttempt(res.attempt);
        if (onPassed) onPassed();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setResult(null);
    setAnswers({});
    setTimeLeft(quiz.time_limit_minutes * 60);
    setStarted(true);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isTimeWarning = timeLeft < 60 && timeLeft > 0;

  if (!started && !result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Lesson Quiz
          </span>
          {bestAttempt && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                bestAttempt.passed
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              Best Score: {bestAttempt.score}% ({bestAttempt.passed ? 'Passed ✓' : 'Failed'})
            </span>
          )}
        </div>

        <h3 className="mt-3 text-xl font-bold text-slate-900">{quiz.title}</h3>
        {quiz.description && (
          <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
        )}

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span className="block font-semibold text-slate-800">Questions</span>
            {quiz.questions?.length ?? 0} questions
          </div>
          <div>
            <span className="block font-semibold text-slate-800">Time Limit</span>
            {quiz.time_limit_minutes} minutes
          </div>
          <div>
            <span className="block font-semibold text-slate-800">Passing Score</span>
            {quiz.passing_score}% required
          </div>
        </div>

        {quiz.is_required && (
          <p className="mt-4 text-xs font-medium text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            ⚠️ You must achieve at least {quiz.passing_score}% score on this quiz to complete this lesson and unlock subsequent lessons.
          </p>
        )}

        <button
          onClick={() => setStarted(true)}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition"
        >
          {bestAttempt ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Results Banner */}
        <div
          className={`rounded-2xl p-6 text-center ${
            result.passed
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <div className="text-4xl mb-2">{result.passed ? '🎉' : '❌'}</div>
          <h3 className="text-2xl font-bold">
            {result.passed ? 'Congratulations! You Passed!' : 'Quiz Not Passed'}
          </h3>
          <p className="mt-1 text-sm font-medium">
            Your score: <span className="text-lg font-bold">{result.score}%</span> (Passing score: {quiz.passing_score}%)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Correct answers: {result.attempt.correct_answers} / {result.attempt.total_questions}
          </p>

          <button
            onClick={handleRetake}
            className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
          >
            Try Again
          </button>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900">Answer Explanations & Review:</h4>

          {(quiz.questions || []).map((q, idx) => {
            const gradedItem = result.graded.find((g) => g.question_id === q.id);
            const isCorrect = gradedItem?.is_correct;

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-rose-200 bg-rose-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {idx + 1}. {q.question}
                  </p>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? 'Correct ✓' : 'Incorrect ✕'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 pl-2">
                  {(q.options || []).map((opt) => {
                    const isSelected = gradedItem?.selected_option_id === opt.id;
                    const isTheCorrectOne = gradedItem?.correct_option_id === opt.id;

                    return (
                      <div
                        key={opt.id}
                        className={`text-xs p-2 rounded-lg flex items-center justify-between ${
                          isTheCorrectOne
                            ? 'bg-emerald-100/70 text-emerald-950 font-semibold'
                            : isSelected
                              ? 'bg-rose-100/70 text-rose-950 line-through'
                              : 'text-slate-600'
                        }`}
                      >
                        <span>{opt.option_text}</span>
                        {isTheCorrectOne && (
                          <span className="text-emerald-700 font-bold ml-2">✓ Correct Answer</span>
                        )}
                        {isSelected && !isTheCorrectOne && (
                          <span className="text-rose-700 font-bold ml-2">Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {gradedItem?.explanation && (
                  <div className="mt-3 rounded-lg bg-blue-50/70 p-2.5 text-xs text-blue-900 border border-blue-100">
                    💡 <span className="font-semibold">Explanation:</span> {gradedItem.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* Quiz Header & Countdown */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
            In Progress
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{quiz.title}</h3>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold ${
            isTimeWarning
              ? 'bg-rose-100 text-rose-700 animate-pulse'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-200">
          {error}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {(quiz.questions || []).map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <p className="text-sm font-bold text-slate-900">
              <span className="text-blue-600 mr-1.5">{idx + 1}.</span>
              {q.question}
            </p>

            <div className="space-y-2">
              {(q.options || []).map((opt) => {
                const checked = answers[q.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleSelectOption(q.id, opt.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition ${
                      checked
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={checked}
                      onChange={() => handleSelectOption(q.id, opt.id)}
                      className="text-blue-600"
                    />
                    <span>{opt.option_text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Answered {Object.keys(answers).length} / {quiz.questions?.length ?? 0}
        </span>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </div>
    </form>
  );
}
