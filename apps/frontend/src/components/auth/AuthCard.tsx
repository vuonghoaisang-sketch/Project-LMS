import Card from '@/components/ui/Card';

type AuthCardProps = {
  children: React.ReactNode;
};

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <Card>
      <div className="w-full max-w-md">{children}</div>
    </Card>
  );
}
