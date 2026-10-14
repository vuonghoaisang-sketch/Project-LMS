export type UserRole = 'admin' | 'instructor' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}
