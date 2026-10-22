import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentResponse } from '../../../../core/models/domain.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    NgFor,
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    StatusChipComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="doctor-dashboard-page fade-in">
      <!-- COMPACT HEADER -->
      <div class="dashboard-top-bar">
        <div>
          <div class="role-badge">Bác sĩ chuyên môn</div>
          <h1 class="page-title">
            Chào mừng, Bác sĩ {{ currentUser?.fullName ?? currentUser?.username }}
          </h1>
          <p class="page-subtitle">
            Ưu tiên xử lý các ca hẹn chờ xác nhận và chuẩn bị lịch trực khám tiếp theo.
          </p>
        </div>
        <div class="top-actions">
          <a mat-flat-button color="primary" routerLink="/doctor/schedule" class="btn-top">
            <mat-icon>calendar_month</mat-icon>
            <span>Xem lịch làm việc</span>
          </a>
          <a mat-stroked-button routerLink="/doctor/appointments" class="btn-top-outline">
            <mat-icon>pending_actions</mat-icon>
            <span>Tất cả lịch hẹn</span>
          </a>
        </div>
      </div>

      <!-- STATS ROW -->
      <div class="stats-row">
        <mat-card class="stat-card stat-pending">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>pending_actions</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">
                <span *ngIf="!statsLoading && !statsError">{{ pendingCount }}</span>
                <span *ngIf="statsLoading" class="stat-loading-val">...</span>
                <span *ngIf="statsError" class="stat-error-val" title="Không thể tải số liệu">--</span>
              </div>
              <div class="stat-label">Chờ xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-confirmed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>event_available</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">
                <span *ngIf="!statsLoading && !statsError">{{ confirmedCount }}</span>
                <span *ngIf="statsLoading" class="stat-loading-val">...</span>
                <span *ngIf="statsError" class="stat-error-val" title="Không thể tải số liệu">--</span>
              </div>
              <div class="stat-label">Đã xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-completed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">
                <span *ngIf="!statsLoading && !statsError">{{ completedCount }}</span>
                <span *ngIf="statsLoading" class="stat-loading-val">...</span>
                <span *ngIf="statsError" class="stat-error-val" title="Không thể tải số liệu">--</span>
              </div>
              <div class="stat-label">Đã hoàn thành</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-schedules">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>schedule</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">
                <span *ngIf="!statsLoading && !statsError">{{ openScheduleCount }}</span>
                <span *ngIf="statsLoading" class="stat-loading-val">...</span>
                <span *ngIf="statsError" class="stat-error-val" title="Không thể tải số liệu">--</span>
              </div>
              <div class="stat-label">Ca khám chưa kết thúc</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <p *ngIf="statsError" role="alert">Không thể tải thống kê.
        <button mat-button (click)="loadData()">Thử lại</button>
      </p>
      <!-- RECENT APPOINTMENTS -->
      <mat-card class="recent-card">
        <div class="card-header-bar">
          <div>
            <h2 class="card-title">Lịch hẹn gần đây</h2>
            <p class="card-subtitle">Lịch hẹn theo giờ khám, từ mới đến cũ</p>
          </div>
          <a mat-stroked-button color="primary" routerLink="/doctor/appointments" class="view-all-btn">
            <span>Xem tất cả<span *ngIf="!isLoading && !hasError"> ({{ totalAppointments }})</span></span>
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <mat-card-content>
          <!-- Loading -->
          <app-loading *ngIf="isLoading" message="Đang tải danh sách lịch hẹn..."></app-loading>

          <!-- Error -->
          <div class="error-banner" *ngIf="!isLoading && hasError">
            <mat-icon class="err-icon">error_outline</mat-icon>
            <div class="err-text">
              <strong>Không thể tải dữ liệu lịch hẹn</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button mat-stroked-button color="warn" (click)="loadData()">
              <mat-icon>refresh</mat-icon>
              Thử lại
            </button>
          </div>

          <!-- Empty -->
          <app-empty-state
            *ngIf="!isLoading && !hasError && recentAppointments.length === 0"
            icon="event_busy"
            title="Chưa có lịch hẹn nào"
            message="Các lịch khám bệnh nhân đăng ký sẽ tự động xuất hiện tại đây."
          ></app-empty-state>

          <!-- List -->
          <div class="appt-list" *ngIf="!isLoading && !hasError && recentAppointments.length > 0">
            <div class="appt-row" *ngFor="let a of recentAppointments">
              <div class="appt-time">
                <div class="time-val">{{ a.startAt | date:'HH:mm' }}</div>
                <div class="date-val">{{ a.startAt | date:'dd/MM/yyyy' }}</div>
              </div>
              <div class="appt-patient">
                <div class="patient-avatar"><mat-icon>person</mat-icon></div>
                <div class="patient-info">
                  <span class="patient-name">{{ a.patientFullName || ('Mã bệnh nhân #' + a.patientAccountId) }}</span>
                  <span class="patient-desc">Phiếu hẹn khám số #{{ a.id }}</span>
                </div>
              </div>
              <div class="appt-status">
                <app-status-chip [status]="mapStatus(a.status)"></app-status-chip>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .doctor-dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .dashboard-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 22px 28px;
      gap: 20px;
    }

    .role-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #0f766e;
      background: #ccfbf1;
      padding: 2px 10px;
      border-radius: 9999px;
      margin-bottom: 6px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.01em;
    }

    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .top-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-top {
      height: 40px;
      padding: 0 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0d9488 !important;
    }

    .btn-top-outline {
      height: 40px;
      padding: 0 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #334155;
    }

    /* STATS ROW */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px !important;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .stat-pending   { .stat-icon { background: #fef3c7; mat-icon { color: #d97706; } } }
    .stat-confirmed { .stat-icon { background: #e0f2fe; mat-icon { color: #0284c7; } } }
    .stat-completed { .stat-icon { background: #dcfce7; mat-icon { color: #16a34a; } } }
    .stat-schedules { .stat-icon { background: #ccfbf1; mat-icon { color: #0d9488; } } }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;

      .stat-error-val {
        color: #dc2626;
        font-size: 22px;
      }

      .stat-loading-val {
        color: #94a3b8;
        font-weight: 400;
        letter-spacing: 2px;
        font-size: 20px;
      }
    }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; }

    /* RECENT APPOINTMENTS */
    .recent-card {
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      overflow: hidden;
    }

    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .card-subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0;
    }

    .view-all-btn {
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .appt-list {
      display: flex;
      flex-direction: column;
    }

    .appt-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 24px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;

      &:last-child { border-bottom: none; }
      &:hover { background: #f8fafc; }
    }

    .appt-time {
      min-width: 80px;
      text-align: center;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .time-val { font-size: 14px; font-weight: 700; color: #0f172a; }
    .date-val { font-size: 11px; color: #64748b; margin-top: 1px; }

    .appt-patient {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .patient-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .patient-info {
      display: flex;
      flex-direction: column;
    }

    .patient-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .patient-desc {
      font-size: 12px;
      color: #64748b;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      margin: 16px 24px;
      color: #991b1b;

      .err-icon { color: #ef4444; font-size: 22px; width: 22px; height: 22px; }
      .err-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .dashboard-top-bar { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr; }
      .appt-row { flex-wrap: wrap; }
    }
  `],
})
export class DoctorDashboardComponent implements OnInit {
  recentAppointments: AppointmentResponse[] = [];
  openScheduleCount = 0;
  totalAppointments = 0;
  pendingCount = 0;
  confirmedCount = 0;
  completedCount = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  statsLoading = false;
  statsError = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  get currentUser() { return this.authService.getCurrentUser(); }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.appointmentService.getDoctorAppointments(0, 5).subscribe({
      next: (res) => {
        const all = res.data?.content ?? [];
        this.totalAppointments = res.data.totalElements;
        this.recentAppointments = all.slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải lịch hẹn.';
      },
    });

    this.statsLoading = true;
    this.statsError = false;
    this.appointmentService.getDoctorSummary().subscribe({
      next: (res) => {
        this.pendingCount = res.data.pendingCount;
        this.confirmedCount = res.data.confirmedCount;
        this.completedCount = res.data.completedCount;
        this.openScheduleCount = res.data.openScheduleCount;
        this.statsLoading = false;
      },
      error: () => {
        this.statsLoading = false;
        this.statsError = true;
      },
    });
  }

  mapStatus(status: string): StatusType {
    const map: Record<string, StatusType> = {
      PENDING: 'pending', CONFIRMED: 'confirmed',
      COMPLETED: 'completed', CANCELED: 'cancelled', EXPIRED: 'expired', NO_SHOW: 'no-show',
    };
    return map[status] ?? 'pending';
  }
}
