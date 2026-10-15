import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.model';

/** Validator: kiểm tra confirmPassword khớp với password */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | null;
  const confirm = control.get('confirmPassword')?.value as string | null;
  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
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
    <div class="register-page">
      <div class="register-header">
        <h2 class="register-title">Tạo tài khoản</h2>
        <p class="register-subtitle">Đăng ký để đặt lịch khám bệnh trực tuyến</p>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <!-- Full Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Họ và tên</mat-label>
          <input
            matInput
            formControlName="fullName"
            placeholder="Nguyễn Văn A"
            id="register-fullname"
          />
          <mat-icon matSuffix>badge</mat-icon>
          <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">
            Vui lòng nhập họ tên
          </mat-error>
          <mat-error *ngIf="registerForm.get('fullName')?.hasError('minlength')">
            Họ tên phải có ít nhất 4 ký tự
          </mat-error>
        </mat-form-field>

        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="email@example.com"
            autocomplete="email"
            id="register-email"
          />
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
            Vui lòng nhập email
          </mat-error>
          <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
            Email không hợp lệ
          </mat-error>
        </mat-form-field>

        <!-- Phone -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Số điện thoại</mat-label>
          <input
            matInput
            type="tel"
            formControlName="phone"
            placeholder="0912345678"
            id="register-phone"
          />
          <mat-icon matSuffix>phone</mat-icon>
          <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">
            Vui lòng nhập số điện thoại
          </mat-error>
          <mat-error *ngIf="registerForm.get('phone')?.hasError('pattern')">
            Số điện thoại không hợp lệ
          </mat-error>
        </mat-form-field>

        <!-- Username -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tên đăng nhập</mat-label>
          <input
            matInput
            formControlName="username"
            placeholder="Ít nhất 4 ký tự"
            autocomplete="username"
            id="register-username"
          />
          <mat-icon matSuffix>person_outline</mat-icon>
          <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
            Vui lòng nhập tên đăng nhập
          </mat-error>
          <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
            Tên đăng nhập phải có ít nhất 4 ký tự
          </mat-error>
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mật khẩu</mat-label>
          <input
            matInput
            [type]="hidePassword ? 'password' : 'text'"
            formControlName="password"
            placeholder="Ít nhất 8 ký tự"
            autocomplete="new-password"
            id="register-password"
          />
          <button
            mat-icon-button matSuffix type="button"
            (click)="hidePassword = !hidePassword"
          >
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
            Vui lòng nhập mật khẩu
          </mat-error>
          <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
            Mật khẩu phải có ít nhất 8 ký tự
          </mat-error>
        </mat-form-field>

        <!-- Confirm Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Xác nhận mật khẩu</mat-label>
          <input
            matInput
            [type]="hideConfirmPassword ? 'password' : 'text'"
            formControlName="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            autocomplete="new-password"
            id="register-confirm-password"
          />
          <button
            mat-icon-button matSuffix type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword"
          >
            <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
            Vui lòng xác nhận mật khẩu
          </mat-error>
          <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
            Mật khẩu xác nhận không khớp
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
          id="register-submit"
          [disabled]="isLoading"
        >
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          <span *ngIf="!isLoading">Tạo tài khoản</span>
        </button>
      </form>

      <div class="register-footer">
        <p>
          Đã có tài khoản?
          <a routerLink="/login" class="link" id="register-to-login">Đăng nhập</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      padding: 28px 32px 24px;
    }

    .register-header {
      margin-bottom: 24px;
    }

    .register-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
    }

    .register-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .full-width { width: 100%; }

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

    .register-footer {
      margin-top: 20px;
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
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+]{9,15}$/)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    if (this.authService.isAuthenticated()) {
      this.authService.redirectToHome();
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { confirmPassword: _confirm, ...rest } = this.registerForm.value as RegisterRequest & { confirmPassword: string };
    const request: RegisterRequest = rest as RegisterRequest;

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.redirectToHome();
      },
      error: (err: { error?: { message?: string }; status?: number }) => {
        this.isLoading = false;
        if (err?.status === 409) {
          this.errorMessage = 'Tên đăng nhập hoặc email đã tồn tại';
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
      },
    });
  }
}
