/**
 * activitiesKeys
 * TanStack Query Key Factory Pattern.
 * Centralizes cache keys to prevent cache invalidation bugs and typos.
 *
 * Usage:
 * - queryClient.invalidateQueries({ queryKey: activitiesKeys.all })    // Invalidate everything
 * - queryClient.invalidateQueries({ queryKey: activitiesKeys.lists() }) // Invalidate only lists
 * - queryClient.invalidateQueries({ queryKey: activitiesKeys.detail(id) }) // Invalidate specific detail
 */
export const activitiesKeys = {
  all: ['activities'] as const,
  lists: () => [...activitiesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    filters ? ([...activitiesKeys.lists(), { filters }] as const) : activitiesKeys.lists(),
  details: () => [...activitiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...activitiesKeys.details(), id] as const,
};
