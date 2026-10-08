import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf],
  template: `
    <div class="error-state">
      <mat-icon class="error-icon">error_outline</mat-icon>
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-message" *ngIf="message">{{ message }}</p>
      <button
        *ngIf="showRetry"
        mat-stroked-button
        color="warn"
        (click)="retryClicked.emit()"
      >
        <mat-icon>refresh</mat-icon>
        Thử lại
      </button>
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 12px;
      text-align: center;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }

    .error-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }

    .error-message {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
      max-width: 300px;
    }
  `],
})
export class ErrorStateComponent {
  @Input() title = 'Đã xảy ra lỗi';
  @Input() message?: string;
  @Input() showRetry = true;
  @Output() retryClicked = new EventEmitter<void>();
}
