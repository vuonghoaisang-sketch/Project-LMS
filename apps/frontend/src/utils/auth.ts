export function getUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const user = localStorage.getItem('user');

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}
