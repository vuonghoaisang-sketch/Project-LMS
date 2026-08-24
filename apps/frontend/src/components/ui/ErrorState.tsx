interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  description,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-xl font-bold text-red-700">{title}</h2>

      <p className="mt-2 text-red-600">
        {description || message || 'An unexpected error occurred.'}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
