/** Wrapper response chung từ backend Spring Boot */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** Phân trang */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
