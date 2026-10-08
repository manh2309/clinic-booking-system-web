/** Các role trong hệ thống — backend trả về dạng ROLE_PATIENT */
export enum Role {
  PATIENT = 'ROLE_PATIENT',
  DOCTOR  = 'ROLE_DOCTOR',
  ADMIN   = 'ROLE_ADMIN',
}

/** Thông tin người dùng hiện tại (lưu trong localStorage) */
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  avatar?: string;
}

/** Account response từ backend */
export interface AccountResponse {
  id: number;
  username: string;
  email: string;
  roleName: Role | string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  active?: boolean;
}
