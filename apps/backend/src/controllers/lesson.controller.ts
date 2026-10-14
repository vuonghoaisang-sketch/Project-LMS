import { Request, Response } from "express";

import {
  createLessonService,
  getLessonsService,
  getLessonService,
  updateLessonService,
  deleteLessonService,
  addLessonAttachmentService,
  deleteLessonAttachmentService,
  getLessonAttachmentsService,
} from "../services/lesson.service";

import { validateLessonInput } from "../validators/lesson.validator";

export async function createLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lesson = await createLessonService({
    ...req.body,
    course_id: courseId,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    video_type: req.body.video_type === "upload" ? "upload" : "embed",
    video_url: req.body.video_url.trim(),
    position: Number(req.body.position),
  });

  return res.status(201).json({
    success: true,
    message: "Create lesson successfully",
    lesson,
  });
}

export async function getLessonsController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lessons = await getLessonsService(courseId);

  return res.json({
    success: true,
    lessons,
  });
}

export async function getLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  const lesson = await getLessonService(id);

  return res.json({
    success: true,
    lesson,
  });
}

export async function updateLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await updateLessonService(id, {
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    video_type: req.body.video_type === "upload" ? "upload" : "embed",
    video_url: req.body.video_url.trim(),
    position: Number(req.body.position),
  });

  return res.json({
    success: true,
    message: "Update lesson successfully",
  });
}

export async function deleteLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await deleteLessonService(id);

  return res.json({
    success: true,
    message: "Delete lesson successfully",
  });
}

export async function addAttachmentController(req: Request, res: Response) {
  const lessonId = Number(req.params.id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  const { name, file_url, file_size, file_type } = req.body;

  if (!name || !file_url) {
    return res.status(400).json({
      success: false,
      message: "Name and file_url are required",
    });
  }

  const attachment = await addLessonAttachmentService(lessonId, {
    name: String(name).trim(),
    fileUrl: String(file_url).trim(),
    fileSize: Number(file_size) || 0,
    fileType: String(file_type || "application/octet-stream").trim(),
  });

  return res.status(201).json({
    success: true,
    message: "Attachment added successfully",
    attachment,
  });
}

export async function deleteAttachmentController(req: Request, res: Response) {
  const attachmentId = Number(req.params.attachmentId);

  if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid attachment id",
    });
  }

  await deleteLessonAttachmentService(attachmentId);

  return res.json({
    success: true,
    message: "Attachment deleted successfully",
  });
}

export async function getAttachmentsController(req: Request, res: Response) {
  const lessonId = Number(req.params.id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  const attachments = await getLessonAttachmentsService(lessonId);

  return res.json({
    success: true,
    attachments,
  });
}
