import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    NgIf,
  ],
  template: `
    <div class="login-page">
      <div class="login-header">
        <h2 class="login-title">Đăng nhập</h2>
        <p class="login-subtitle">Chào mừng bạn quay trở lại</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <!-- Username -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tên đăng nhập</mat-label>
          <input
            matInput
            formControlName="username"
            placeholder="Nhập tên đăng nhập"
            autocomplete="username"
            id="login-username"
          />
          <mat-icon matSuffix>person_outline</mat-icon>
          <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
            Vui lòng nhập tên đăng nhập
          </mat-error>
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mật khẩu</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            placeholder="Nhập mật khẩu"
            autocomplete="current-password"
            id="login-password"
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="hidePassword ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'"
          >
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
            Vui lòng nhập mật khẩu
          </mat-error>
        </mat-form-field>

        <!-- Error message -->
        <div class="error-banner" *ngIf="errorMessage">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit -->
        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="submit-btn"
          id="login-submit"
          [disabled]="isLoading"
        >
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          <span *ngIf="!isLoading">Đăng nhập</span>
        </button>
      </form>

      <div class="login-footer">
        <p>
          Chưa có tài khoản?
          <a routerLink="/register" class="link" id="login-to-register">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      padding: 32px 32px 24px;
    }

    .login-header {
      margin-bottom: 28px;
    }

    .login-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
    }

    .login-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width {
      width: 100%;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      font-size: 14px;

      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

    .submit-btn {
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      padding-bottom: 8px;
    }

    .link {
      color: #1565c0;
      font-weight: 600;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }
  `],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  errorMessage = '';
  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Nếu đã login thì redirect về home
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToHome();
      return;
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = this.loginForm.value as LoginRequest;

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.authService.redirectToHome();
        }
      },
      error: (err: { error?: { message?: string }; status?: number }) => {
        this.isLoading = false;
        if (err?.status === 401 || err?.status === 400) {
          this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
        } else {
          this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
        }
      },
    });
  }
}
