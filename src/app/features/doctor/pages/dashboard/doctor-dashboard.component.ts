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
    <div>
      <app-page-header
        title="Dashboard"
        [subtitle]="'Xin chào, Bác sĩ ' + (currentUser?.fullName ?? currentUser?.username ?? '') + '!'"
      ></app-page-header>

      <!-- Stats Row -->
      <div class="stats-row">
        <mat-card class="stat-card stat-card--pending">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>pending_actions</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">Chờ xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--confirmed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>event_available</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ confirmedCount }}</div>
              <div class="stat-label">Đã xác nhận</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--completed">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>check_circle</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount }}</div>
              <div class="stat-label">Hoàn thành</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--schedules">
          <mat-card-content>
            <div class="stat-icon"><mat-icon>calendar_month</mat-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ schedules.length }}</div>
              <div class="stat-label">Lịch làm việc</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Recent Appointments -->
      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Lịch hẹn gần đây</mat-card-title>
          <span class="spacer"></span>
          <a mat-button color="primary" routerLink="/doctor/appointments">Xem tất cả</a>
        </mat-card-header>
        <mat-card-content>
          <div class="appt-list">
            <div class="appt-row" *ngFor="let a of recentAppointments">
              <div class="appt-time">
                <div class="time-val">{{ a.startAt | date:'HH:mm' }}</div>
                <div class="date-val">{{ a.startAt | date:'dd/MM' }}</div>
              </div>
              <div class="appt-patient">
                <mat-icon>person</mat-icon>
                Bệnh nhân #{{ a.patientAccountId }}
              </div>
              <app-status-chip [status]="mapStatus(a.status)"></app-status-chip>
            </div>

            <div class="empty-text" *ngIf="recentAppointments.length === 0">
              Chưa có lịch hẹn nào
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card { border-radius: 12px; }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }

    .stat-card--pending   .stat-icon { background: #fff3e0; mat-icon { color: #e65100; } }
    .stat-card--confirmed .stat-icon { background: #e3f2fd; mat-icon { color: #1565c0; } }
    .stat-card--completed .stat-icon { background: #e8f5e9; mat-icon { color: #2e7d32; } }
    .stat-card--schedules .stat-icon { background: #f3e5f5; mat-icon { color: #7b1fa2; } }

    .stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1; }
    .stat-label { font-size: 13px; color: #6b7280; margin-top: 2px; }

    .recent-card { border-radius: 12px; }

    .recent-card mat-card-header {
      display: flex;
      align-items: center;
    }

    .spacer { flex: 1; }

    .appt-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .appt-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .appt-time {
      min-width: 56px;
      text-align: center;
    }

    .time-val { font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .date-val { font-size: 12px; color: #6b7280; }

    .appt-patient {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #374151;
      mat-icon { color: #6b7280; font-size: 18px; width: 18px; height: 18px; }
    }

    .empty-text { color: #9ca3af; font-size: 14px; padding: 16px 0; text-align: center; }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
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
