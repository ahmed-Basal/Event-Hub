export interface ServerErrorPayload {
  statusCode?: number;
  message?: string;
  details?: string;
  traceId?: string;
  path?: string;
  method?: string;
  timestamp?: string;
}

export interface ValidationErrorResponse {
  title?: string;
  status?: number;
  errors?: Record<string, string[]> | string[];
}

export interface AppError {
  message: string;
  statusCode?: number;
  details?: string;
}
