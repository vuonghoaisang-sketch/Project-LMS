import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${className} `}
      {...props}
    >
      {children}
    </div>
  );
}
