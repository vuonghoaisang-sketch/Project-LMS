import { UserRole } from "../constants/roles";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: UserRole | string;
  created_at?: string | Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string | Date;
}
