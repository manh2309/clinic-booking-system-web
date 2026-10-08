import { User, AccountResponse, Role } from './user.model';

/** Payload gửi lên khi đăng nhập */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Payload gửi lên khi đăng ký */
export interface RegisterRequest {
  username: string;
  fullName: string;
  password: string;
  email: string;
  phone?: string;
}

/** Phản hồi sau khi đăng nhập thành công */
export interface AuthenticationResponse {
  accessToken: string;
  tokenType: string;
  account: AccountResponse;
}
