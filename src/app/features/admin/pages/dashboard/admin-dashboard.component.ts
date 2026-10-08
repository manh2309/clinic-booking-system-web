import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgIf, NgFor, RouterLink, PageHeaderComponent],
  template: `
    <div>
      <app-page-header
        title="Admin Dashboard"
        subtitle="Tổng quan hệ thống Clinic Booking"
      ></app-page-header>

      <!-- Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stat-blue"><mat-icon>group</mat-icon></div>
            <div class="stat-body">
              <div class="stat-value">{{ accountCount }}</div>
              <div class="stat-label">Tài khoản</div>
              <a routerLink="/admin/accounts" class="stat-link">Quản lý →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stat-green"><mat-icon>medical_services</mat-icon></div>
            <div class="stat-body">
              <div class="stat-value">{{ doctorCount }}</div>
              <div class="stat-label">Bác sĩ</div>
              <a routerLink="/admin/doctors" class="stat-link">Quản lý →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stat-purple"><mat-icon>local_hospital</mat-icon></div>
            <div class="stat-body">
              <div class="stat-value">{{ specialtyCount }}</div>
              <div class="stat-label">Chuyên khoa</div>
              <a routerLink="/admin/specialties" class="stat-link">Quản lý →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon stat-orange"><mat-icon>event_note</mat-icon></div>
            <div class="stat-body">
              <div class="stat-value">{{ appointmentCount }}</div>
              <div class="stat-label">Lịch hẹn</div>
              <a routerLink="/admin/appointments" class="stat-link">Quản lý →</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card { border-radius: 12px; }

    .stat-card mat-card-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px !important;
    }

    .stat-icon {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }

    .stat-blue   { background: #e3f2fd; mat-icon { color: #1565c0; } }
    .stat-green  { background: #e8f5e9; mat-icon { color: #2e7d32; } }
    .stat-purple { background: #f3e5f5; mat-icon { color: #7b1fa2; } }
    .stat-orange { background: #fff3e0; mat-icon { color: #e65100; } }

    .stat-value { font-size: 32px; font-weight: 800; color: #1a1a2e; line-height: 1; }
    .stat-label { font-size: 13px; color: #6b7280; margin: 4px 0; }
    .stat-link  { font-size: 12px; color: #1565c0; text-decoration: none; font-weight: 600; }
    .stat-link:hover { text-decoration: underline; }

    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class AdminDashboardComponent implements OnInit {
  accountCount = 0;
  doctorCount = 0;
  specialtyCount = 0;
  appointmentCount = 0;

  constructor(
    private adminService: AdminService,
    private specialtyService: SpecialtyService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.adminService.getAllAccounts().subscribe({
      next: (r) => { this.accountCount = r.data?.length ?? 0; },
    });
    this.specialtyService.getAll().subscribe({
      next: (r) => { this.specialtyCount = r.data?.length ?? 0; },
    });
    this.doctorService.search({ size: 1 }).subscribe({
      next: (r) => { this.doctorCount = r.data?.totalElements ?? 0; },
    });
  }
}
