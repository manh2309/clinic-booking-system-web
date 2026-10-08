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

/**
 * AuthService — xử lý đăng nhập, đăng ký, đăng xuất và trạng thái xác thực.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authUrl = `${environment.apiBaseUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.storageService.getUser()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {}

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
    if (!user) { this.router.navigate(['/login']); return; }
    const route = ROLE_HOME_ROUTES[user.role] ?? '/login';
    this.router.navigate([route]);
  }

  /** Xử lý sau login: lưu token + user */
  private handleAuthSuccess(data: AuthenticationResponse): void {
    if (!data?.accessToken) return;
    this.storageService.setToken(data.accessToken);

    const acc = data.account;
    // Backend trả roleName = "ROLE_PATIENT" | "ROLE_DOCTOR" | "ROLE_ADMIN"
    const roleStr = (acc.roleName ?? '').toString().toUpperCase() as Role;
    const role: Role = Object.values(Role).includes(roleStr)
      ? roleStr
      : Role.PATIENT;

    const user: User = {
      id: acc.id,
      username: acc.username,
      email: acc.email,
      fullName: acc.username, // backend AccountResponse chưa có fullName → dùng username tạm
      role,
    };

    this.storageService.setUser(user);
    this.currentUserSubject.next(user);
  }
}
