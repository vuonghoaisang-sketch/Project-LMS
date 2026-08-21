import {
  createEnrollment,
  findEnrollment,
  getEnrollmentsByUser,
  getEnrollmentCount,
} from "../models/enrollment.model";

import AppError from "../utils/AppError";

export async function enrollUser(userId: number, courseId: number) {
  const existingEnrollment = await findEnrollment(userId, courseId);

  if (existingEnrollment) {
    throw new AppError("User already enrolled in this course", 409);
  }

  return createEnrollment(userId, courseId);
}

export async function getUserEnrollments(userId: number) {
  return getEnrollmentsByUser(userId);
}

export async function isUserEnrolled(userId: number, courseId: number) {
  const enrollment = await findEnrollment(userId, courseId);

  return !!enrollment;
}

export async function getCourseEnrollmentCount(courseId: number) {
  return getEnrollmentCount(courseId);
}
