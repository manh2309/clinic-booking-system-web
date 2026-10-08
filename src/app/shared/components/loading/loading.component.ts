import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule, NgIf],
  template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message" class="loading-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .loading-message {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }
  `],
})
export class LoadingComponent {
  @Input() isLoading = true;
  @Input() diameter = 48;
  @Input() message?: string;
}
