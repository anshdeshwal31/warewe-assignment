export interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: string;
  name?: string;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
}

export interface RequestHistoryItem {
  id: number;
  url: string;
  method: string;
  headers?: string;
  body?: string;
  response?: string;
  statusCode?: number;
  createdAt: Date;
  updatedAt: Date;
  responseTime?: number;
  name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
