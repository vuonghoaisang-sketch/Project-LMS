export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const COURSE_CATEGORIES = [
  'All',
  'General',
  'Development',
  'Design',
  'Business',
  'Marketing',
] as const;

export const APP_ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  MY_COURSES: '/my-courses',
  CREATE_COURSE: '/create-course',
  USERS: '/users',
} as const;
