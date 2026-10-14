import { Request, Response } from "express";
import {
  getNotificationsForUser,
  markNotificationsRead,
  getUnreadCount,
} from "../models/notification.model";

export async function getNotificationsController(req: Request, res: Response) {
  const user = (req as any).user;
  const notifications = await getNotificationsForUser(user.id);
  return res.json({ success: true, notifications });
}

export async function markReadController(req: Request, res: Response) {
  const user = (req as any).user;
  await markNotificationsRead(user.id);
  return res.json({
    success: true,
    message: "All notifications marked as read",
  });
}

export async function getUnreadCountController(req: Request, res: Response) {
  const user = (req as any).user;
  const count = await getUnreadCount(user.id);
  return res.json({ success: true, count });
}
