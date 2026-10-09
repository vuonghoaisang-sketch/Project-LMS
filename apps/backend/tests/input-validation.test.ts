import assert from "node:assert/strict";
import test from "node:test";

import {
  validateLoginInput,
  validateRegisterInput,
} from "../src/validators/auth.validator";
import { validateCourseInput } from "../src/validators/course.validator";
import { validateLessonInput } from "../src/validators/lesson.validator";
import { requireRole } from "../src/middlewares/role.middleware";
import { authMiddleware } from "../src/middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";

function createResponse() {
  const response: {
    statusCode: number;
    body: unknown;
    status: (code: number) => typeof response;
    json: (body: unknown) => typeof response;
  } = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
}

test("registration accepts valid student account input", () => {
  assert.deepEqual(
    validateRegisterInput({
      name: "Alex Doe",
      email: "alex@example.com",
      password: "secret1",
    }),
    {},
  );
});

test("registration rejects malformed fields and non-object payloads", () => {
  assert.deepEqual(validateRegisterInput(null), {
    name: "Name must be between 2 and 100 characters",
    email: "A valid email address of at most 255 characters is required",
    password: "Password must be at least 6 characters and at most 72 UTF-8 bytes",
  });
});

test("login requires a valid email and a non-empty password", () => {
  assert.deepEqual(validateLoginInput({ email: "bad", password: "" }), {
    email: "A valid email address is required",
    password: "Password is required",
  });
});

test("login accepts valid credentials", () => {
  assert.deepEqual(
    validateLoginInput({ email: "alex@example.com", password: "secret" }),
    {},
  );
});

test("course validation rejects too-short text and negative prices", () => {
  assert.deepEqual(
    validateCourseInput({ title: "x", description: "short", price: -1 }),
    {
      title: "Course title must be between 3 and 200 characters",
      description: "Course description must be between 10 and 10000 characters",
      price: "Price must be between 0 and 99999999.99",
    },
  );
});

test("course validation accepts valid course data", () => {
  assert.deepEqual(
    validateCourseInput({
      title: "TypeScript Basics",
      description: "Learn the basics of TypeScript.",
      price: 0,
    }),
    {},
  );
});

test("course validation rejects oversized category labels", () => {
  assert.equal(
    validateCourseInput({
      title: "TypeScript Basics",
      description: "Learn the basics of TypeScript.",
      category: "c".repeat(101),
      price: 0,
    }).category,
    "Category must be between 1 and 100 characters",
  );
});

test("lesson validation rejects invalid video URLs and positions", () => {
  assert.deepEqual(
    validateLessonInput({
      title: "Hi",
      description: "A useful introduction.",
      video_url: " ",
      position: 0,
    }),
    {
      title: "Lesson title must be between 3 and 200 characters",
      video_url: "Video URL is required",
      position: "Position must be a positive integer",
    },
  );
});

test("lesson validation accepts valid lesson data", () => {
  assert.deepEqual(
    validateLessonInput({
      title: "Introduction",
      description: "A useful introduction lesson.",
      video_url: "https://example.com/video",
      position: 1,
    }),
    {},
  );
});

test("lesson validation rejects non-web protocols and non-object payloads", () => {
  assert.equal(
    validateLessonInput({
      title: "A valid lesson",
      description: "A long enough lesson description.",
      video_url: "javascript:alert(1)",
      position: 1,
    }).video_url,
    "Video URL must use HTTP or HTTPS",
  );
  assert.deepEqual(validateLessonInput(null), {
    title: "Lesson title must be between 3 and 200 characters",
    description: "Lesson description must be between 10 and 10000 characters",
    video_url: "Video URL is required",
    position: "Position is required",
  });
});

test("role middleware allows a permitted role", () => {
  const req = { user: { id: 1, role: "admin" } } as unknown as Request;
  const res = createResponse();
  let continued = false;

  requireRole(["admin"])(req, res as unknown as Response, (() => {
    continued = true;
  }) as NextFunction);

  assert.equal(continued, true);
  assert.equal(res.statusCode, 200);
});

test("role middleware rejects a role without permission", () => {
  const req = { user: { id: 2, role: "student" } } as unknown as Request;
  const res = createResponse();
  let continued = false;

  requireRole(["admin"])(req, res as unknown as Response, (() => {
    continued = true;
  }) as NextFunction);

  assert.equal(continued, false);
  assert.equal(res.statusCode, 403);
});

test("role middleware rejects requests without an authenticated user", () => {
  const req = {} as Request;
  const res = createResponse();
  let continued = false;

  requireRole(["admin"])(req, res as unknown as Response, (() => {
    continued = true;
  }) as NextFunction);

  assert.equal(continued, false);
  assert.equal(res.statusCode, 401);
});

test("authentication middleware rejects missing and invalid bearer tokens", async () => {
  for (const authorization of [undefined, "Bearer invalid-token"]) {
    const req = {
      headers: authorization ? { authorization } : {},
    } as Request;
    const res = createResponse();
    let continued = false;

    await authMiddleware(req, res as unknown as Response, (() => {
      continued = true;
    }) as NextFunction);

    assert.equal(continued, false);
    assert.equal(res.statusCode, 401);
  }
});
