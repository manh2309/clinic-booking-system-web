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
    <div class="admin-dashboard-page">
      <div class="dashboard-hero">
        <div class="hero-text">
          <h1 class="hero-title">Bảng Điều Khiển Quản Trị Hệ Thống</h1>
          <p class="hero-desc">
            Theo dõi thời gian thực các chỉ số vận hành bệnh viện, quản lý nhân sự y bác sĩ và tài nguyên hệ thống.
          </p>
        </div>
        <div class="hero-actions">
          <a mat-flat-button color="primary" routerLink="/admin/doctors" class="hero-btn">
            <mat-icon>add_moderator</mat-icon>
            <span>Quản lý Bác sĩ</span>
          </a>
          <a mat-stroked-button routerLink="/patient/home" class="hero-btn-light">
            <mat-icon>visibility</mat-icon>
            <span>Xem Cổng Bệnh nhân</span>
          </a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <mat-card class="stat-card stat-accounts">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Người dùng</span>
              <div class="stat-icon-wrapper"><mat-icon>manage_accounts</mat-icon></div>
            </div>
            <div class="stat-number">{{ accountCount }}</div>
            <div class="stat-title">Tài khoản trên hệ thống</div>
            <div class="stat-footer">
              <a routerLink="/admin/accounts" class="stat-link">Chi tiết tài khoản & quyền hạn →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-doctors">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Đội ngũ y tế</span>
              <div class="stat-icon-wrapper"><mat-icon>medical_services</mat-icon></div>
            </div>
            <div class="stat-number">{{ doctorCount }}</div>
            <div class="stat-title">Bác sĩ chuyên khoa hoạt động</div>
            <div class="stat-footer">
              <a routerLink="/admin/doctors" class="stat-link">Hồ sơ chuyên môn & lịch trực →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-specialties">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Chuyên khoa</span>
              <div class="stat-icon-wrapper"><mat-icon>local_hospital</mat-icon></div>
            </div>
            <div class="stat-number">{{ specialtyCount }}</div>
            <div class="stat-title">Khoa lâm sàng & Cận lâm sàng</div>
            <div class="stat-footer">
              <a routerLink="/admin/specialties" class="stat-link">Danh mục chuyên khoa y tế →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-appointments">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Đặt khám</span>
              <div class="stat-icon-wrapper"><mat-icon>event_available</mat-icon></div>
            </div>
            <div class="stat-number">24/7</div>
            <div class="stat-title">Vận hành đặt khám tự động</div>
            <div class="stat-footer">
              <a routerLink="/admin/appointments" class="stat-link">Giám sát luồng đặt khám →</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="quick-actions-section">
        <h2 class="section-title">Thao tác Quản trị Nhanh</h2>
        <div class="action-tiles">
          <a routerLink="/admin/doctors" class="action-tile">
            <div class="tile-icon tile-blue"><mat-icon>person_add</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Quản lý Bác sĩ</span>
              <span class="tile-sub">Thêm bác sĩ mới, cấp quyền và phân bổ chuyên khoa</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/admin/specialties" class="action-tile">
            <div class="tile-icon tile-teal"><mat-icon>domain_add</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Cấu hình Chuyên khoa</span>
              <span class="tile-sub">Thiết lập danh mục dịch vụ khám & phòng ban</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/admin/accounts" class="action-tile">
            <div class="tile-icon tile-purple"><mat-icon>verified_user</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Kiểm soát Tài khoản</span>
              <span class="tile-sub">Kích hoạt, khóa tài khoản và phân quyền người dùng</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/patient/home" class="action-tile">
            <div class="tile-icon tile-amber"><mat-icon>storefront</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Xem Cổng Bệnh nhân</span>
              <span class="tile-sub">Trải nghiệm giao diện đặt lịch phía khách hàng</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .dashboard-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
    }

    .hero-title {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    .hero-desc {
      font-size: 14px;
      color: #94a3b8;
      max-width: 580px;
      margin: 0;
      line-height: 1.5;
    }

    .hero-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .hero-btn {
      height: 44px;
      padding: 0 18px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      background: #ef4444 !important;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4) !important;
    }

    .hero-btn-light {
      height: 44px;
      padding: 0 18px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #e2e8f0;
      border-color: rgba(255, 255, 255, 0.2);
      &:hover { background: rgba(255, 255, 255, 0.08); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .stat-card {
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
      }

      mat-card-content {
        padding: 24px !important;
        display: flex;
        flex-direction: column;
      }
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .stat-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .stat-icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    .stat-accounts {
      .stat-badge { background: #e0f2fe; color: #0369a1; }
      .stat-icon-wrapper { background: #e0f2fe; mat-icon { color: #0284c7; } }
    }

    .stat-doctors {
      .stat-badge { background: #ccfbf1; color: #0f766e; }
      .stat-icon-wrapper { background: #ccfbf1; mat-icon { color: #0d9488; } }
    }

    .stat-specialties {
      .stat-badge { background: #f3e8ff; color: #7e22ce; }
      .stat-icon-wrapper { background: #f3e8ff; mat-icon { color: #9333ea; } }
    }

    .stat-appointments {
      .stat-badge { background: #fee2e2; color: #b91c1c; }
      .stat-icon-wrapper { background: #fee2e2; mat-icon { color: #ef4444; } }
    }

    .stat-number {
      font-size: 36px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .stat-title {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .stat-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
      margin-top: auto;
    }

    .stat-link {
      font-size: 12px;
      font-weight: 600;
      color: #0284c7;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .quick-actions-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
    }

    .section-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 16px;
    }

    .action-tiles {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .action-tile {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      background: #f8fafc;
      text-decoration: none;
      transition: all 0.2s;

      &:hover {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
        transform: translateY(-1px);

        .tile-arrow { transform: translateX(3px); color: #0284c7; }
      }
    }

    .tile-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .tile-blue   { background: #e0f2fe; color: #0284c7; }
    .tile-teal   { background: #ccfbf1; color: #0d9488; }
    .tile-purple { background: #f3e8ff; color: #9333ea; }
    .tile-amber  { background: #fef3c7; color: #d97706; }

    .tile-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .tile-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .tile-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .tile-arrow {
      color: #94a3b8;
      font-size: 20px;
      transition: transform 0.2s, color 0.2s;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-hero { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .action-tiles { grid-template-columns: 1fr; }
    }
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
