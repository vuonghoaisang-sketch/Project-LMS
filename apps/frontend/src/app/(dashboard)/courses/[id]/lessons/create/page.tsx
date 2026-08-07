import LessonForm from '@/components/lesson/LessonForm';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateLessonPage({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Create Lesson</h1>
      <LessonForm courseId={Number(id)} />
    </div>
  );
}
