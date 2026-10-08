import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
      <button
        *ngIf="actionLabel"
        mat-flat-button
        color="primary"
        (click)="actionClicked.emit()"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 12px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--text-disabled);
    }

    .empty-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--text-secondary);
      margin: 0;
    }

    .empty-message {
      font-size: 14px;
      color: var(--text-disabled);
      margin: 0;
      max-width: 300px;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Không có dữ liệu';
  @Input() message?: string;
  @Input() actionLabel?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
