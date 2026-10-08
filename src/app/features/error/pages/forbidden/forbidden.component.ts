import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-icon-wrapper">
          <mat-icon class="error-icon">lock</mat-icon>
        </div>
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Truy cập bị từ chối</h2>
        <p class="error-message">
          Bạn không có quyền truy cập vào trang này.<br />
          Vui lòng liên hệ quản trị viên nếu đây là nhầm lẫn.
        </p>
        <div class="error-actions">
          <button mat-flat-button color="primary" (click)="goHome()" id="forbidden-go-home">
            <mat-icon>home</mat-icon>
            Về trang chủ
          </button>
          <button mat-stroked-button (click)="goBack()" id="forbidden-go-back">
            <mat-icon>arrow_back</mat-icon>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
    }

    .error-content {
      text-align: center;
      padding: 40px 24px;
      max-width: 480px;
    }

    .error-icon-wrapper {
      width: 96px;
      height: 96px;
      background: #fef2f2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ef5350;
    }

    .error-code {
      font-size: 80px;
      font-weight: 800;
      color: #ef5350;
      margin: 0;
      line-height: 1;
      letter-spacing: -4px;
    }

    .error-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 12px 0 12px;
    }

    .error-message {
      font-size: 15px;
      color: #6b7280;
      line-height: 1.7;
      margin: 0 0 32px;
    }

    .error-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
  `],
})
export class ForbiddenComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goHome(): void {
    this.authService.redirectToHome();
  }

  goBack(): void {
    window.history.back();
  }
}
