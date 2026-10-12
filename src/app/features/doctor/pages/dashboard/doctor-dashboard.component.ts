import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { AppointmentResponse, ScheduleResponse } from '../../../../core/models/domain.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    NgIf, NgFor, DatePipe, RouterLink,
    PageHeaderComponent, StatusChipComponent,
  ],
  template: `
    <div class="doctor-dashboard-page">
      <!-- Doctor Hero -->
      <div class="doctor-hero">
        <div class="hero-left">
          <div class="hero-badge">Không gian làm việc Chuyên môn</div>
          <h1 class="hero-title">Xin chào, Bác sĩ {{ currentUser?.fullName ?? currentUser?.username }}!</h1>
          <p class="hero-sub">
            Chúc bác sĩ một ngày làm việc hiệu quả. Hãy theo dõi và xử lý các ca hẹn khám của bệnh nhân bên dưới.
          </p>
        </div>
        <div class="hero-right">
          <a mat-flat-button color="primary" routerLink="/doctor/schedule" class="hero-btn">
            <mat-icon>calendar_month</mat-icon>
            <span>Đăng ký ca làm việc</span>
          </a>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <mat-card class="stat-card stat-pending">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>pending_actions</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">Chờ xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-confirmed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>event_available</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ confirmedCount }}</div>
              <div class="stat-label">Đã xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-completed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount }}</div>
              <div class="stat-label">Đã hoàn thành</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-schedules">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>schedule</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ schedules.length }}</div>
              <div class="stat-label">Ca khám mở</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Appointments -->
      <mat-card class="recent-card">
        <div class="card-header-custom">
          <div>
            <h2 class="card-title">Danh sách Lịch hẹn gần đây</h2>
            <p class="card-subtitle">Các bệnh nhân đã đăng ký khám trong ca của bạn</p>
          </div>
          <a mat-stroked-button color="primary" routerLink="/doctor/appointments" class="view-all-btn">
            <span>Xem tất cả</span>
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <mat-card-content>
          <div class="appt-list" *ngIf="recentAppointments.length > 0">
            <div class="appt-row" *ngFor="let a of recentAppointments">
              <div class="appt-time">
                <div class="time-val">{{ a.startAt | date:'HH:mm' }}</div>
                <div class="date-val">{{ a.startAt | date:'dd/MM/yyyy' }}</div>
              </div>
              <div class="appt-patient">
                <div class="patient-avatar"><mat-icon>person</mat-icon></div>
                <div class="patient-info">
                  <span class="patient-name">Mã bệnh nhân #{{ a.patientAccountId }}</span>
                  <span class="patient-desc">Phiếu khám số #{{ a.id }}</span>
                </div>
              </div>
              <div class="appt-status">
                <app-status-chip [status]="mapStatus(a.status)"></app-status-chip>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="recentAppointments.length === 0">
            <div class="empty-icon"><mat-icon>event_busy</mat-icon></div>
            <p class="empty-text">Hiện chưa có lịch hẹn khám nào được đặt</p>
            <p class="empty-sub">Các lịch hẹn mới của bệnh nhân sẽ tự động hiển thị tại đây.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .doctor-dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .doctor-hero {
      background: linear-gradient(135deg, #042f2e 0%, #115e59 100%);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(4, 47, 46, 0.25);
    }

    .hero-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: #5eead4;
      background: rgba(94, 234, 212, 0.15);
      border: 1px solid rgba(94, 234, 212, 0.3);
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }

    .hero-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    .hero-sub {
      font-size: 14px;
      color: #ccfbf1;
      margin: 0;
      max-width: 580px;
      line-height: 1.5;
    }

    .hero-btn {
      height: 44px;
      padding: 0 18px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      background: #0d9488 !important;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4) !important;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { font-size: 26px; width: 26px; height: 26px; }
    }

    .stat-pending   { .stat-icon { background: #fef3c7; mat-icon { color: #d97706; } } }
    .stat-confirmed { .stat-icon { background: #e0f2fe; mat-icon { color: #0284c7; } } }
    .stat-completed { .stat-icon { background: #dcfce7; mat-icon { color: #16a34a; } } }
    .stat-schedules { .stat-icon { background: #ccfbf1; mat-icon { color: #0d9488; } } }

    .stat-value { font-size: 30px; font-weight: 800; color: #0f172a; line-height: 1; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }

    .recent-card {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
    }

    .card-header-custom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
    }

    .card-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .card-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 2px 0 0;
    }

    .view-all-btn {
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }

    .appt-list {
      display: flex;
      flex-direction: column;
    }

    .appt-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 24px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;

      &:last-child { border-bottom: none; }
      &:hover { background: #f8fafc; }
    }

    .appt-time {
      min-width: 80px;
      text-align: center;
      padding: 6px 12px;
      background: #f1f5f9;
      border-radius: 10px;
    }

    .time-val { font-size: 15px; font-weight: 700; color: #0f172a; }
    .date-val { font-size: 11px; color: #64748b; margin-top: 2px; }

    .appt-patient {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .patient-avatar {
      width: 38px;
      height: 38px;
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
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .patient-desc {
      font-size: 12px;
      color: #64748b;
    }

    .empty-state {
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .empty-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;

      mat-icon { font-size: 32px; width: 32px; height: 32px; }
    }

    .empty-text {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }

    .empty-sub {
      font-size: 13px;
      color: #94a3b8;
      margin: 4px 0 0;
    }

    @media (max-width: 900px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .doctor-hero { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr; }
      .appt-row { flex-wrap: wrap; }
    }
  `],
})
export class DoctorDashboardComponent implements OnInit {
  recentAppointments: AppointmentResponse[] = [];
  schedules: ScheduleResponse[] = [];
  pendingCount = 0;
  confirmedCount = 0;
  completedCount = 0;

  constructor(
    private appointmentService: AppointmentService,
    private scheduleService: ScheduleService,
    private authService: AuthService
  ) {}

  get currentUser() { return this.authService.getCurrentUser(); }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.appointmentService.getDoctorAppointments(0, 50).subscribe({
      next: (res) => {
        const all = res.data?.content ?? [];
        this.recentAppointments = all.slice(0, 5);
        this.pendingCount   = all.filter(a => a.status === 'PENDING').length;
        this.confirmedCount = all.filter(a => a.status === 'CONFIRMED').length;
        this.completedCount = all.filter(a => a.status === 'COMPLETED').length;
      },
    });

    this.scheduleService.getMySchedules().subscribe({
      next: (res) => { this.schedules = res.data ?? []; },
    });
  }

  mapStatus(status: string): StatusType {
    const map: Record<string, StatusType> = {
      PENDING: 'pending', CONFIRMED: 'confirmed',
      COMPLETED: 'completed', CANCELED: 'cancelled',
    };
    return map[status] ?? 'pending';
  }
}
