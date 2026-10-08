import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { ScheduleResponse, SlotResponse } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    NgIf, NgFor, DatePipe,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
  ],
  template: `
    <div>
      <app-page-header title="Lịch làm việc" subtitle="Quản lý khung giờ khám bệnh"></app-page-header>

      <div class="schedule-layout">
        <!-- Add Schedule Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Tạo lịch mới</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="scheduleForm" (ngSubmit)="onCreate()" class="schedule-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Thời gian bắt đầu</mat-label>
                <input matInput type="datetime-local" formControlName="startAt" />
                <mat-error *ngIf="scheduleForm.get('startAt')?.hasError('required')">Bắt buộc</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Thời gian kết thúc</mat-label>
                <input matInput type="datetime-local" formControlName="endAt" />
                <mat-error *ngIf="scheduleForm.get('endAt')?.hasError('required')">Bắt buộc</mat-error>
              </mat-form-field>

              <button mat-flat-button color="primary" type="submit" class="create-btn" [disabled]="isCreating">
                <mat-spinner *ngIf="isCreating" diameter="18"></mat-spinner>
                <mat-icon *ngIf="!isCreating">add</mat-icon>
                <span>{{ isCreating ? 'Đang tạo...' : 'Tạo lịch' }}</span>
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Schedules List -->
        <div class="schedules-section">
          <app-loading *ngIf="isLoading" message="Đang tải lịch làm việc..."></app-loading>

          <app-empty-state
            *ngIf="!isLoading && schedules.length === 0"
            icon="calendar_month"
            title="Chưa có lịch làm việc"
            message="Tạo lịch làm việc để bệnh nhân có thể đặt khám"
          ></app-empty-state>

          <mat-card class="schedule-card" *ngFor="let schedule of schedules">
            <mat-card-content>
              <div class="schedule-header">
                <div class="schedule-time">
                  <mat-icon>calendar_month</mat-icon>
                  <div>
                    <div class="time-main">{{ schedule.startAt | date:'HH:mm' }} – {{ schedule.endAt | date:'HH:mm' }}</div>
                    <div class="time-date">{{ schedule.startAt | date:'EEEE, dd/MM/yyyy' }}</div>
                  </div>
                </div>
                <div class="schedule-meta">
                  <span class="slot-count">{{ schedule.slots?.length ?? 0 }} slot</span>
                  <button mat-icon-button color="warn" (click)="deleteSchedule(schedule)" title="Xóa lịch">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Slots list -->
              <div class="slots-list" *ngIf="schedule.slots && schedule.slots.length > 0">
                <span class="slot-chip" *ngFor="let slot of schedule.slots">
                  {{ slot.startAt | date:'HH:mm' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 20px;
      align-items: start;
    }

    .form-card, .schedule-card { border-radius: 12px; }

    .schedule-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width { width: 100%; }

    .create-btn {
      height: 44px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .schedules-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .schedule-time {
      display: flex;
      align-items: center;
      gap: 12px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #1565c0; }
    }

    .time-main { font-size: 16px; font-weight: 600; color: #1a1a2e; }
    .time-date { font-size: 13px; color: #6b7280; margin-top: 2px; }

    .schedule-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .slot-count {
      background: #e3f2fd;
      color: #1565c0;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 12px;
    }

    .slots-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .slot-chip {
      background: #f0f4ff;
      color: #3b4fb8;
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .schedule-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class DoctorScheduleComponent implements OnInit {
  scheduleForm!: FormGroup;
  schedules: ScheduleResponse[] = [];
  isLoading = false;
  isCreating = false;

  constructor(
    private fb: FormBuilder,
    private scheduleService: ScheduleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.scheduleForm = this.fb.group({
      startAt: ['', Validators.required],
      endAt:   ['', Validators.required],
    });
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.scheduleService.getMySchedules().subscribe({
      next: (res) => {
        this.schedules = res.data ?? [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onCreate(): void {
    if (this.scheduleForm.invalid) { this.scheduleForm.markAllAsTouched(); return; }
    this.isCreating = true;
    const { startAt, endAt } = this.scheduleForm.value as { startAt: string; endAt: string };
    this.scheduleService.create({
      startAt: new Date(startAt).toISOString(),
      endAt:   new Date(endAt).toISOString(),
    }).subscribe({
      next: () => {
        this.isCreating = false;
        this.scheduleForm.reset();
        this.snackBar.open('Tạo lịch thành công!', 'Đóng', { duration: 3000, panelClass: 'success-snackbar' });
        this.loadSchedules();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isCreating = false;
        this.snackBar.open(err?.error?.message ?? 'Tạo lịch thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  deleteSchedule(schedule: ScheduleResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa lịch làm việc',
        message: `Xóa lịch ngày ${new Date(schedule.startAt).toLocaleDateString('vi-VN')}? Các slot chưa được đặt sẽ bị xóa.`,
        confirmLabel: 'Xóa',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.scheduleService.delete(schedule.id).subscribe({
        next: () => {
          this.snackBar.open('Đã xóa lịch', 'Đóng', { duration: 3000 });
          this.loadSchedules();
        },
        error: (err: { error?: { message?: string } }) => {
          this.snackBar.open(err?.error?.message ?? 'Xóa thất bại', 'Đóng', { duration: 3000 });
        },
      });
    });
  }
}
