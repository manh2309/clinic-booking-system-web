import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'warn' | 'accent';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <mat-dialog-content>
        <h2 class="dialog-title">{{ data.title }}</h2>
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelLabel ?? 'Hủy' }}
        </button>
        <button
          mat-flat-button
          [color]="data.confirmColor ?? 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel ?? 'Xác nhận' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 8px 0;
      min-width: 300px;
      max-width: 420px;
    }

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px;
      color: var(--text-primary);
    }

    .dialog-message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
