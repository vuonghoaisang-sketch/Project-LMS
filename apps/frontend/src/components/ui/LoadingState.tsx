interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = 'Loading...',
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
