export interface AuthInputErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function validateRegisterInput(data: unknown): AuthInputErrors {
  const input = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const errors: AuthInputErrors = {};

  if (
    typeof input.name !== "string" ||
    input.name.trim().length < 2 ||
    input.name.trim().length > 100
  ) {
    errors.name = "Name must be between 2 and 100 characters";
  }

  if (
    typeof input.email !== "string" ||
    input.email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    errors.email = "A valid email address of at most 255 characters is required";
  }

  if (
    typeof input.password !== "string" ||
    input.password.length < 6 ||
    Buffer.byteLength(input.password, "utf8") > 72
  ) {
    errors.password = "Password must be at least 6 characters and at most 72 UTF-8 bytes";
  }

  return errors;
}

export function validateLoginInput(data: unknown): AuthInputErrors {
  const input = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const errors: AuthInputErrors = {};

  if (
    typeof input.email !== "string" ||
    input.email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    errors.email = "A valid email address is required";
  }

  if (typeof input.password !== "string" || input.password.length === 0) {
    errors.password = "Password is required";
  }

  return errors;
}
