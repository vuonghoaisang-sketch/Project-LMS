export function validateCourseInput(data: unknown) {
  const input = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const errors: Record<string, string> = {};

  if (
    typeof input.title !== "string" ||
    input.title.trim().length < 3 ||
    input.title.trim().length > 200
  ) {
    errors.title = "Course title must be between 3 and 200 characters";
  }

  if (
    typeof input.description !== "string" ||
    input.description.trim().length < 10 ||
    input.description.length > 10000
  ) {
    errors.description = "Course description must be between 10 and 10000 characters";
  }

  if (
    input.category !== undefined &&
    (typeof input.category !== "string" ||
      input.category.trim().length < 1 ||
      input.category.trim().length > 100)
  ) {
    errors.category = "Category must be between 1 and 100 characters";
  }

  if (input.price === undefined || input.price === null || input.price === "") {
    errors.price = "Price is required";
  } else {
    const price = Number(input.price);

    if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
      errors.price = "Price must be between 0 and 99999999.99";
    }
  }

  return errors;
}
