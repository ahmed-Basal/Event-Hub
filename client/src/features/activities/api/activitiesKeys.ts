
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    filters ? ([...activitiesKeys.lists(), { filters }] as const) : activitiesKeys.lists(),
  details: () => [...activitiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...activitiesKeys.details(), id] as const,
};
