export function validateLessonInput(data: unknown) {
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
    errors.title = "Lesson title must be between 3 and 200 characters";
  }

  if (
    typeof input.description !== "string" ||
    input.description.trim().length < 10 ||
    input.description.length > 10000
  ) {
    errors.description = "Lesson description must be between 10 and 10000 characters";
  }

  if (
    typeof input.video_url !== "string" ||
    !input.video_url.trim()
  ) {
    errors.video_url = "Video URL is required";
  } else if (input.video_url.length > 2048) {
    errors.video_url = "Video URL must be 2048 characters or fewer";
  } else {
    try {
      const url = new URL(input.video_url);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        errors.video_url = "Video URL must use HTTP or HTTPS";
      }
    } catch {
      errors.video_url = "Video URL must be a valid URL";
    }
  }

  if (
    input.position === undefined ||
    input.position === null ||
    input.position === ""
  ) {
    errors.position = "Position is required";
  } else {
    const position = Number(input.position);

    if (!Number.isInteger(position) || position < 1) {
      errors.position = "Position must be a positive integer";
    }
  }

  return errors;
}
