import { z } from 'zod';

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters'),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters'),

  price: z.number().min(0, 'Price cannot be negative'),
});

export type CourseFormData = z.infer<typeof courseSchema>;
