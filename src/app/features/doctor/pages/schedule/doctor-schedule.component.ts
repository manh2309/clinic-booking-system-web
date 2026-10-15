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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    NgIf,
    NgFor,
    DatePipe,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="fade-in doctor-schedule-page">
      <app-page-header
        title="Lịch làm việc"
        subtitle="Quản lý ca làm việc và các khung giờ khám 30 phút của bác sĩ"
      ></app-page-header>

      <div class="schedule-layout">
        <!-- LEFT COLUMN: CREATE FORM & INSTRUCTION -->
        <div class="form-column">
          <!-- Instruction Hint Box -->
          <div class="hint-box">
            <mat-icon class="hint-icon">info</mat-icon>
            <div class="hint-text">
              <strong>Quy tắc tạo ca khám (Slot 30 phút)</strong>
              <p>
                Hệ thống tự động phân chia ca làm việc thành các khung giờ 30 phút giữa thời gian bắt đầu và kết thúc.
                Vui lòng chọn thời gian trong cùng một ngày và ở tương lai.
              </p>
            </div>
          </div>

          <!-- Add Schedule Form -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Đăng ký ca làm việc mới</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="scheduleForm" (ngSubmit)="onCreate()" class="schedule-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Thời gian bắt đầu</mat-label>
                  <input matInput type="datetime-local" formControlName="startAt" />
                  <mat-icon matPrefix>play_circle</mat-icon>
                  <mat-error *ngIf="scheduleForm.get('startAt')?.hasError('required')">Bắt buộc</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Thời gian kết thúc</mat-label>
                  <input matInput type="datetime-local" formControlName="endAt" />
                  <mat-icon matPrefix>stop_circle</mat-icon>
                  <mat-error *ngIf="scheduleForm.get('endAt')?.hasError('required')">Bắt buộc</mat-error>
                </mat-form-field>

                <button mat-flat-button color="primary" type="submit" class="create-btn" [disabled]="isCreating">
                  <mat-spinner *ngIf="isCreating" diameter="18" class="spinner-inline"></mat-spinner>
                  <mat-icon *ngIf="!isCreating">add</mat-icon>
                  <span>{{ isCreating ? 'Đang tạo ca...' : 'Tạo lịch làm việc' }}</span>
                </button>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- RIGHT COLUMN: SCHEDULES LIST -->
        <div class="schedules-section">
          <!-- Loading -->
          <app-loading *ngIf="isLoading" message="Đang tải lịch làm việc..."></app-loading>

          <!-- Error Banner -->
          <div class="error-banner" *ngIf="!isLoading && hasError">
            <mat-icon class="err-icon">error_outline</mat-icon>
            <div class="err-text">
              <strong>Không thể tải lịch làm việc</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button mat-stroked-button color="warn" (click)="loadSchedules()">
              <mat-icon>refresh</mat-icon>
              Thử lại
            </button>
          </div>

          <!-- Empty State (Only when NOT loading and NO error) -->
          <app-empty-state
            *ngIf="!isLoading && !hasError && schedules.length === 0"
            icon="calendar_month"
            title="Chưa có ca làm việc nào"
            message="Đăng ký ca làm việc ở biểu mẫu bên cạnh để bệnh nhân có thể chọn giờ khám."
          ></app-empty-state>

          <!-- Schedule Cards -->
          <ng-container *ngIf="!isLoading && !hasError && schedules.length > 0">
            <div class="section-title-row">
              <span class="count-tag">Đã tạo {{ schedules.length }} ca khám</span>
            </div>

            <mat-card class="schedule-card" *ngFor="let schedule of schedules">
              <mat-card-content>
                <div class="schedule-header">
                  <div class="schedule-time">
                    <div class="cal-icon"><mat-icon>calendar_month</mat-icon></div>
                    <div>
                      <div class="time-main">
                        {{ schedule.startAt | date:'HH:mm' }} – {{ schedule.endAt | date:'HH:mm' }}
                      </div>
                      <div class="time-date">
                        {{ schedule.startAt | date:'EEEE, dd/MM/yyyy' }}
                      </div>
                    </div>
                  </div>
                  <div class="schedule-meta">
                    <span class="slot-count">{{ schedule.slots?.length ?? 0 }} slot (30 phút)</span>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="deleteSchedule(schedule)"
                      title="Xóa ca khám"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Slots List -->
                <div class="slots-list" *ngIf="schedule.slots && schedule.slots.length > 0">
                  <span class="slot-chip" *ngFor="let slot of schedule.slots">
                    {{ slot.startAt | date:'HH:mm' }}
                  </span>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doctor-schedule-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .schedule-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
      align-items: start;
    }

    .form-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hint-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 12px;
      color: #0f766e;

      .hint-icon {
        color: #0d9488;
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-top: 1px;
        flex-shrink: 0;
      }

      .hint-text {
        strong {
          display: block;
          font-size: 13px;
          margin-bottom: 3px;
        }
        p {
          font-size: 12px;
          line-height: 1.45;
          margin: 0;
          color: #115e59;
        }
      }
    }

    .form-card {
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      background: #ffffff !important;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04) !important;
    }

    .form-card mat-card-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }

    .schedule-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 10px;
    }

    .full-width { width: 100%; }

    .create-btn {
      height: 42px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      border-radius: 8px;
    }

    .schedules-section {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .count-tag {
      font-size: 12px;
      font-weight: 600;
      color: #0f766e;
      background: #ccfbf1;
      padding: 3px 10px;
      border-radius: 9999px;
    }

    .schedule-card {
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      background: #ffffff !important;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04) !important;
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
    }

    .cal-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f0fdfa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { color: #0d9488; font-size: 22px; width: 22px; height: 22px; }
    }

    .time-main { font-size: 15px; font-weight: 700; color: #0f172a; }
    .time-date { font-size: 12px; color: #64748b; margin-top: 2px; }

    .schedule-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .slot-count {
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
    }

    .slots-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .slot-chip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #991b1b;

      .err-icon { color: #ef4444; font-size: 22px; width: 22px; height: 22px; }
      .err-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }

    .spinner-inline { margin-right: 6px; }

    @media (max-width: 900px) {
      .schedule-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class DoctorScheduleComponent implements OnInit {
  scheduleForm!: FormGroup;
  schedules: ScheduleResponse[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
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
    this.hasError = false;
    this.errorMessage = '';

    this.scheduleService.getMySchedules().subscribe({
      next: (res) => {
        this.schedules = res.data ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải lịch làm việc.';
      },
    });
  }

  onCreate(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    this.isCreating = true;
    const { startAt, endAt } = this.scheduleForm.value as { startAt: string; endAt: string };
    this.scheduleService.create({
      startAt: this.formatLocalDateTime(startAt),
      endAt:   this.formatLocalDateTime(endAt),
    }).subscribe({
      next: () => {
        this.isCreating = false;
        this.scheduleForm.reset();
        this.snackBar.open('Tạo lịch làm việc thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.loadSchedules();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isCreating = false;
        this.snackBar.open(err?.error?.message ?? 'Tạo lịch thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  /**
   * Định dạng chuỗi thời gian từ input datetime-local (YYYY-MM-DDTHH:mm)
   * thành LocalDateTime chuẩn ISO (YYYY-MM-DDTHH:mm:ss) theo giờ địa phương phòng khám,
   * không chuyển đổi sang UTC (tránh bị lệch múi giờ và tránh đuôi 'Z' gây lỗi Jackson backend).
   */
  private formatLocalDateTime(dt: string): string {
    if (!dt) return '';
    const trimmed = dt.trim();
    if (trimmed.length === 16) {
      return `${trimmed}:00`;
    }
    if (trimmed.endsWith('Z')) {
      return trimmed.slice(0, 19);
    }
    return trimmed;
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
          this.snackBar.open('Đã xóa ca khám thành công!', 'Đóng', { duration: 3000 });
          this.loadSchedules();
        },
        error: (err: { error?: { message?: string } }) => {
          this.snackBar.open(err?.error?.message ?? 'Xóa thất bại', 'Đóng', { duration: 3000 });
        },
      });
    });
  }
}
