import Header from '@/components/layout/Header';
import PublicLayoutClient from '@/components/layout/PublicLayoutClient';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <PublicLayoutClient>{children}</PublicLayoutClient>
    </div>
  );
}
