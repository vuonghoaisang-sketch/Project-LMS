import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data. Please try again.',
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <span className="text-xl font-bold text-red-600">!</span>
      </div>

      <h3 className="text-lg font-semibold text-red-900">{title}</h3>

      <p className="mt-2 max-w-md text-sm text-red-600">{description}</p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
