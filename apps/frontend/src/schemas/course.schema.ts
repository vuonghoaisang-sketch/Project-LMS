import { z } from 'zod';

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),

  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be 10,000 characters or fewer'),

  category: z.string().trim().min(1, 'Category is required').max(100),

  thumbnail: z.string().max(2048, 'Thumbnail URL too long').nullable().optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(99999999.99, 'Price is above the allowed maximum'),
});

export type CourseFormData = z.infer<typeof courseSchema>;
