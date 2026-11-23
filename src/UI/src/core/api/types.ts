export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data: T;
  meta?: PaginationMeta;
}
