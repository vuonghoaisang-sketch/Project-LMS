export function validateLessonInput(data: any) {
  const errors: Record<string, string> = {};

  if (typeof data.title !== "string" || data.title.trim().length < 3) {
    errors.title = "Lesson title must be at least 3 characters";
  }

  if (
    typeof data.description !== "string" ||
    data.description.trim().length < 10
  ) {
    errors.description = "Lesson description must be at least 10 characters";
  }

  if (typeof data.video_url !== "string" || !data.video_url.trim()) {
    errors.video_url = "Video URL is required";
  }

  const position = Number(data.position);

  if (!Number.isInteger(position) || position < 1) {
    errors.position = "Position must be a positive integer";
  }

  return errors;
}
