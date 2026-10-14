'use client';

import { useState } from 'react';
import { createQuiz, updateQuiz } from '@/services/quiz.service';
import { Quiz } from '@/types/quiz';
import { getErrorMessage } from '@/utils/error';

interface QuestionDraft {
  question: string;
  type: 'multiple_choice' | 'true_false';
  explanation: string;
  options: Array<{ option_text: string; is_correct: boolean }>;
}

interface QuizBuilderProps {
  lessonId: number;
  initialQuiz?: Quiz | null;
  onSaved: (quiz: Quiz) => void;
  onCancel?: () => void;
}

export default function QuizBuilder({
  lessonId,
  initialQuiz,
  onSaved,
  onCancel,
}: QuizBuilderProps) {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [timeLimit, setTimeLimit] = useState(initialQuiz?.time_limit_minutes || 10);
  const [passingScore, setPassingScore] = useState(initialQuiz?.passing_score || 80);
  const [isRequired, setIsRequired] = useState(Boolean(initialQuiz?.is_required));

  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuiz?.questions?.map((q) => ({
      question: q.question,
      type: q.type,
      explanation: q.explanation || '',
      options: (q.options || []).map((o) => ({
        option_text: o.option_text,
        is_correct: Boolean(o.is_correct),
      })),
    })) || [
      {
        question: '',
        type: 'multiple_choice',
        explanation: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
        ],
      },
    ],
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleAddQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        type: 'multiple_choice',
        explanation: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  }

  function handleRemoveQuestion(qIndex: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  }

  function handleAddOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: [...q.options, { option_text: '', is_correct: false }],
            }
          : q,
      ),
    );
  }

  function handleRemoveOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length > 2
          ? {
              ...q,
              options: q.options.filter((_, oi) => oi !== oIndex),
            }
          : q,
      ),
    );
  }

  function handleSetCorrectOption(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) => ({
                ...opt,
                is_correct: oi === oIndex,
              })),
            }
          : q,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q.question.trim()) {
        setError(`Question #${qi + 1} is empty`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.is_correct);
      if (!hasCorrect) {
        setError(`Please mark at least one correct answer for Question #${qi + 1}`);
        return;
      }
      for (let oi = 0; oi < q.options.length; oi++) {
        if (!q.options[oi].option_text.trim()) {
          setError(`Option #${oi + 1} in Question #${qi + 1} is empty`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        time_limit_minutes: Number(timeLimit) || 10,
        passing_score: Number(passingScore) || 80,
        is_required: isRequired,
        questions,
      };

      let saved: Quiz;
      if (initialQuiz?.id) {
        saved = await updateQuiz(initialQuiz.id, payload);
      } else {
        saved = await createQuiz(lessonId, payload);
      }

      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {initialQuiz ? 'Edit Lesson Quiz' : 'Create Lesson Quiz'}
          </h3>
          <p className="text-xs text-slate-500">
            Build interactive multiple-choice questions for students to self-test.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Basic Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Quiz Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 1 Quiz: Core Principles"
            className="w-full rounded-xl border p-3 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Time Limit (Minutes)
          </label>
          <input
            type="number"
            min="1"
            max="180"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full rounded-xl border p-3 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full rounded-xl border p-3 text-sm focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span>
              <strong>Required Quiz:</strong> Students must pass this quiz (≥ {passingScore}%) to mark the lesson completed and unlock the next lesson.
            </span>
          </label>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900">Questions ({questions.length})</h4>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            + Add Question
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-700">
                Question #{qIndex + 1}
              </span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete Question
                </button>
              )}
            </div>

            <input
              value={q.question}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item, i) =>
                    i === qIndex ? { ...item, question: e.target.value } : item,
                  ),
                )
              }
              placeholder="Enter question text..."
              className="w-full rounded-xl border bg-white p-3 text-sm focus:border-blue-600 focus:outline-none"
              required
            />

            {/* Options */}
            <div className="space-y-2 pl-2">
              <span className="block text-xs font-bold text-slate-600">
                Options (Click the radio to mark the CORRECT answer):
              </span>

              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={opt.is_correct}
                    onChange={() => handleSetCorrectOption(qIndex, oIndex)}
                    title="Mark as correct answer"
                    className="h-4 w-4 text-emerald-600"
                  />
                  <input
                    value={opt.option_text}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((item, i) =>
                          i === qIndex
                            ? {
                                ...item,
                                options: item.options.map((o, oi) =>
                                  oi === oIndex
                                    ? { ...o, option_text: e.target.value }
                                    : o,
                                ),
                              }
                            : item,
                        ),
                      )
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className={`flex-1 rounded-lg border p-2 text-xs bg-white ${
                      opt.is_correct ? 'border-emerald-500 font-medium' : ''
                    }`}
                    required
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddOption(qIndex)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Explanation (Shown to students after submitting to help them learn):
              </label>
              <input
                value={q.explanation}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((item, i) =>
                      i === qIndex
                        ? { ...item, explanation: e.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="Why is this answer correct? (Optional)"
                className="w-full rounded-lg border bg-white p-2 text-xs"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
      >
        {saving ? 'Saving Quiz...' : initialQuiz ? 'Update Quiz' : 'Save Quiz'}
      </button>
    </form>
  );
}
