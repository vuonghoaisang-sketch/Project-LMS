export function validateCourseInput(data: any) {
  const errors: Record<string, string> = {};

  if (typeof data.title !== "string" || data.title.trim().length < 3) {
    errors.title = "Course title must be at least 3 characters";
  }

  if (
    typeof data.description !== "string" ||
    data.description.trim().length < 10
  ) {
    errors.description = "Course description must be at least 10 characters";
  }

  const price = Number(data.price);

  if (Number.isNaN(price) || price < 0) {
    errors.price = "Price must be a valid non-negative number";
  }

  return errors;
}
