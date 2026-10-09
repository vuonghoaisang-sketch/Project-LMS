import { z } from 'zod';

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be 10,000 characters or fewer'),

  video_url: z
    .string()
    .min(1, 'Video URL is required')
    .max(2048, 'Video URL must be 2048 characters or fewer')
    .url('Please enter a valid video URL'),

  position: z
    .number()
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1'),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
