type AuthTitleProps = {
  title: string;
  description: string;
};

export default function AuthTitle({ title, description }: AuthTitleProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-blue-600">{title}</h1>

      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  );
}
