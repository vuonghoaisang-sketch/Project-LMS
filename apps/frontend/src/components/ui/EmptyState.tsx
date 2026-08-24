interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'No data found',
  message,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border p-8 text-center">
      <h2 className="text-xl font-bold">{title}</h2>

      <p className="mt-2 text-gray-600">
        {description || message || 'There is no data to display.'}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
