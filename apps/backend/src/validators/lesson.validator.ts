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
    const trimmed = input.video_url.trim();
    if (trimmed.startsWith("/uploads/")) {
      // Valid local upload relative path
    } else {
      try {
        const url = new URL(trimmed);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          errors.video_url = "Video URL must use HTTP or HTTPS";
        }
      } catch {
        errors.video_url = "Video URL must be a valid URL";
      }
    }
  }

  if (input.video_type !== undefined && input.video_type !== null) {
    if (input.video_type !== "embed" && input.video_type !== "upload") {
      errors.video_type = "Video type must be either 'embed' or 'upload'";
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
