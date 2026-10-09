import { Course, createCourse, getCourses } from "../models/course.model";
import { findCourseById } from "../models/course.model";
import { updateCourse } from "../models/course.model";
import { deleteCourse } from "../models/course.model";
import AppError from "../utils/AppError";

export async function createNewCourse(data: any) {
  const course = await createCourse(data);
  return course;
}

export async function getAllCourses() {
  const courses = await getCourses();

  return courses;
}

export async function getCourseById(id: number) {
  const course = await findCourseById(id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
}

export async function updateCourseService(id: number, data: any) {
  const course = await findCourseById(id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return updateCourse(id, data);
}

export async function deleteCourseService(id: number) {
  const course = await findCourseById(id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  await deleteCourse(id);

  return true;
}
