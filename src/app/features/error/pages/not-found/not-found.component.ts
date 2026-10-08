import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="error-page">
      <div class="error-content">
        <div class="error-illustration">
          <span class="error-emoji">🔍</span>
        </div>
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Không tìm thấy trang</h2>
        <p class="error-message">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div class="error-actions">
          <button mat-flat-button color="primary" routerLink="/login" id="not-found-go-login">
            <mat-icon>home</mat-icon>
            Về trang đăng nhập
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

    .error-illustration {
      font-size: 80px;
      margin-bottom: 16px;
      line-height: 1;
    }

    .error-emoji { display: block; }

    .error-code {
      font-size: 80px;
      font-weight: 800;
      color: #1565c0;
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
    }
  `],
})
export class NotFoundComponent {}
