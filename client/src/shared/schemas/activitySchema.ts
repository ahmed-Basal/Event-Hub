import { z } from 'zod';

export const CATEGORY_OPTIONS = [
  'BackEnd',
  'CyberSecurity',
  'FrontEnd',
  'DataAnalysis',
  'DevOps',
] as const;

export const LEVEL_OPTIONS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels',
] as const;

export type SchemaCategory = (typeof CATEGORY_OPTIONS)[number];
export type SchemaLevel = (typeof LEVEL_OPTIONS)[number];

export const activitySchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.enum(CATEGORY_OPTIONS, {
    message: 'Category must be one of: BackEnd, CyberSecurity, FrontEnd, DataAnalysis, DevOps',
  }),
  date: z.string().min(1, { message: 'Date is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  venue: z.string().min(1, { message: 'Venue is required' }),
  level: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;
