
export const PATHS = {
  HOME: '/',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAILS: (id: string, slug?: string) =>
    slug ? `/activities/${id}/${slug}` : `/activities/${id}`,
  CREATE_ACTIVITY: '/createActivity',
  MANAGE_ACTIVITY: (id: string) => `/manage/${id}`,
  LOGIN: '/login',
  REGISTER: '/register',
  ERRORS: '/errors',
  NOT_FOUND: '/not-found',
  SERVER_ERROR: '/server-error',
} as const;

export type AppPath = typeof PATHS[keyof typeof PATHS];
