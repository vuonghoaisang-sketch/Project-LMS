interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  text = 'Loading...',
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${
        fullScreen ? 'min-h-[60vh]' : 'py-10'
      }`}
    >
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}
