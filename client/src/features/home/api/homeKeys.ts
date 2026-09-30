// TanStack Query Key Factory for the home feature
export const homeKeys = {
  all: ['home'] as const,
  pageData: () => [...homeKeys.all, 'pageData'] as const,
};
