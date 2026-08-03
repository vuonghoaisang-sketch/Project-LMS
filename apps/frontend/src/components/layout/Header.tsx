export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-xl font-bold text-blue-600">LMS Platform</h1>

      <nav className="flex gap-4">
        <button>Login</button>

        <button>Register</button>
      </nav>
    </header>
  );
}
