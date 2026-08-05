import { createCourse, getCourses } from "../models/course.model";

export async function createNewCourse(data: any) {
  const course = await createCourse(data);

  return course;
}

export async function getAllCourses() {
  const courses = await getCourses();

  return courses;
}
