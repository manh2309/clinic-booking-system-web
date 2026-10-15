import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { User, Role, AccountResponse } from '../models/user.model';
import { StorageService } from './storage.service';
import { ROLE_HOME_ROUTES } from '../constants/app.constants';

/** Chuẩn hóa role linh hoạt từ Backend (hỗ trợ ADMIN, ROLE_ADMIN, DOCTOR, ROLE_DOCTOR, PATIENT, ROLE_PATIENT) */
export function normalizeRole(rawRole?: string | null): Role {
  if (!rawRole) return Role.PATIENT;

  const str = rawRole.toString().toUpperCase().trim();
  if (str === 'ADMIN' || str === 'ROLE_ADMIN' || str.endsWith('_ADMIN')) return Role.ADMIN;
  if (str === 'DOCTOR' || str === 'ROLE_DOCTOR' || str.endsWith('_DOCTOR')) return Role.DOCTOR;
  if (str === 'PATIENT' || str === 'ROLE_PATIENT' || str.endsWith('_PATIENT')) return Role.PATIENT;

  return Role.PATIENT;
}

/**
 * AuthService — xử lý đăng nhập, đăng ký, đăng xuất và trạng thái xác thực.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  private currentUserSubject: BehaviorSubject<User | null>;
  currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    const initialUser = this.getStoredUserWithRoleFix();
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getStoredUserWithRoleFix(): User | null {
    const user = this.storageService.getUser();
    if (!user) return null;

    // Chuẩn hóa role nếu trong storage đang lưu giá trị cũ
    const correctedRole = normalizeRole(user.role);
    if (user.role !== correctedRole) {
      user.role = correctedRole;
      this.storageService.setUser(user);
    }
    return user;
  }

  /** POST /auth/login */
  login(request: LoginRequest): Observable<ApiResponse<AuthenticationResponse>> {
    return this.http
      .post<ApiResponse<AuthenticationResponse>>(`${this.authUrl}/login`, request)
      .pipe(tap((res) => this.handleAuthSuccess(res.data)));
  }

  /** POST /auth/register */
  register(request: RegisterRequest): Observable<ApiResponse<AccountResponse>> {
    return this.http
      .post<ApiResponse<AccountResponse>>(`${this.authUrl}/register`, request);
  }

  /** Đăng xuất */
  logout(): void {
    this.storageService.clearAll();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getToken() && !!this.getCurrentUser();
  }

  hasRole(role: Role): boolean {
    return this.getCurrentUser()?.role === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  redirectToHome(): void {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    const route = ROLE_HOME_ROUTES[user.role] ?? '/patient/home';
    this.router.navigate([route]);
  }

  /** Xử lý sau login: lưu token + user */
  private handleAuthSuccess(data: AuthenticationResponse): void {
    if (!data?.accessToken) return;
    this.storageService.setToken(data.accessToken);

    const acc = data.account;
    const role: Role = normalizeRole(acc.roleName);

    const user: User = {
      id: acc.id,
      username: acc.username,
      email: acc.email,
      fullName: acc.fullName || acc.username,
      role,
    };

    this.storageService.setUser(user);
    this.currentUserSubject.next(user);
  }
}
