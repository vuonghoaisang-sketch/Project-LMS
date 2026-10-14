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

  video_type: z.enum(['embed', 'upload']).default('embed'),

  video_url: z
    .string()
    .min(1, 'Video source is required')
    .max(2048, 'Video URL must be 2048 characters or fewer')
    .refine(
      (val) => {
        if (val.startsWith('/uploads/')) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Please provide a valid video URL or upload a video file' },
    ),

  position: z
    .number()
    .int('Position must be an integer')
    .min(1, 'Position must be at least 1'),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
