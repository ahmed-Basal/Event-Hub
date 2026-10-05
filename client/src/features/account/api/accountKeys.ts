export const accountKeys = {
  all: ['account'] as const,
  currentUser: () => [...accountKeys.all, 'currentUser'] as const,
};
