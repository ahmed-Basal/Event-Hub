import type { ReactNode } from 'react';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions<T = string> {
  field: T;
  order: SortOrder;
}
