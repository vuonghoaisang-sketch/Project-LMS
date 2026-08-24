import { z } from 'zod';

export const lessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters'),

  description: z.string(),

  video_url: z
    .string()
    .min(1, 'Video URL is required')
    .url('Please enter a valid video URL'),

  position: z
    .number()
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1'),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
