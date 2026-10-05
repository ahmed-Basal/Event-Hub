import { z } from 'zod';

export const CategoryEnum = z.enum(
  ['BackEnd', 'CyberSecurity', 'FrontEnd', 'DataAnalysis', 'DevOps'],
  {
    message: 'Category must be one of: BackEnd, CyberSecurity, FrontEnd, DataAnalysis, DevOps',
  }
);
export type SchemaCategory = z.infer<typeof CategoryEnum>;
export const CATEGORY_OPTIONS = CategoryEnum.options;

export const LevelEnum = z.enum(
  ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
  {
    message: 'Level must be one of: Beginner, Intermediate, Advanced, All Levels',
  }
);
export type SchemaLevel = z.infer<typeof LevelEnum>;
export const LEVEL_OPTIONS = LevelEnum.options;

const requiredString = (field: string) =>
  z.string().min(1, { message: `${field} is required` });

export const activitySchema = z.object({
  title: requiredString('Title'),
  description: requiredString('Description'),
  category: CategoryEnum,
  date: requiredString('Date'),
  city: requiredString('City'),
  venue: requiredString('Venue'),
  image: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  level: LevelEnum.optional(),
  tags: z.array(z.string()).optional(),
});

export type ActivitySchema = z.infer<typeof activitySchema>;

export interface ActivityFormData extends ActivitySchema {}


