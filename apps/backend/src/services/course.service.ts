import { Course, createCourse, getCourses } from "../models/course.model";
import { findCourseById } from "../models/course.model";
import { updateCourse } from "../models/course.model";
import { deleteCourse } from "../models/course.model";

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
    throw new Error("Course not found");
  }
  return course;
}

export async function updateCourseService(id: number, data: Course) {
  const existingCourse = await findCourseById(id);

  if (!existingCourse) {
    throw new Error("Course not found");
  }
  await updateCourse(id, data);
  return await findCourseById(id);
}

export async function deleteCourseService(id: number) {
  const course = await findCourseById(id);
  if (!course) {
    throw new Error("Course not found");
  }
  await deleteCourse(id);
  return true;
}
