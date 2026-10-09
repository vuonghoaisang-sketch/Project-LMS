import { randomBytes } from "node:crypto";

const configuredSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET must be set to a value of at least 32 characters");
}

if (configuredSecret && configuredSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

// Local development can start without a .env file. This temporary value resets
// after restart; production must always provide a stable secret.
export const JWT_SECRET = configuredSecret ?? randomBytes(32).toString("hex");
