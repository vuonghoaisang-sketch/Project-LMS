import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <input
        className="rounded-lg border px-4 py-2 transition outline-none focus:border-blue-500"
        {...props}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
