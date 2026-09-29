// ============================================================
// Shared Layer — Public Barrel Export
// SOLID: Single Source of Truth for generic, cross-feature code
// ============================================================

// Feedback Components
export { default as Spinner } from './components/feedback/Spinner';
export { EmptyState, type EmptyStateProps } from './components/feedback/EmptyState';
export { ErrorBoundary } from './components/feedback/ErrorBoundary';

// Tag Components
export { Tag, GradientTag, type TagProps } from './components/tags/Tag';
export { TagList, type TagListProps } from './components/tags/TagList';
export { TagInput, type TagInputProps } from './components/tags/TagInput';

// Logistics Components
export { default as LogisticsCard, type LogisticsCardProps } from './components/logistics/LogisticsCard';

// API Client
export { agent, axiosClient } from './api';

// Utilities
export * from './utils/dateUtils';
export * from './utils/tagUtils';

// Schemas & Types
export * from './schemas';
export * from './types';
