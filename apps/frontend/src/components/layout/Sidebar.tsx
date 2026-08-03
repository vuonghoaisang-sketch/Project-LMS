export default function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r bg-white p-6">
      <h2 className="mb-6 text-lg font-bold">Menu</h2>

      <nav className="flex flex-col gap-3">
        <a href="#">Dashboard</a>

        <a href="#">My Courses</a>

        <a href="#">Profile</a>

        <a href="#">Settings</a>
      </nav>
    </aside>
  );
}
