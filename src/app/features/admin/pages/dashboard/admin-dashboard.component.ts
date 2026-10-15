import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, NgIf, NgFor, RouterLink, PageHeaderComponent],
  template: `
    <div class="admin-dashboard-page fade-in">
      <!-- HEADER BANNER -->
      <div class="dashboard-header-card">
        <div class="header-text">
          <div class="header-badge">Quản trị vận hành</div>
          <h1 class="header-title">Tổng quan hệ thống phòng khám</h1>
          <p class="header-desc">
            Theo dõi các chỉ số nhân sự y tế, danh mục chuyên khoa và tài khoản người dùng trên hệ thống.
          </p>
        </div>
        <div class="header-actions">
          <a mat-flat-button color="primary" routerLink="/admin/doctors" class="action-btn">
            <mat-icon>person_add</mat-icon>
            <span>Thêm bác sĩ</span>
          </a>
          <a mat-stroked-button routerLink="/admin/specialties" class="action-btn-outline">
            <mat-icon>local_hospital</mat-icon>
            <span>Chuyên khoa</span>
          </a>
        </div>
      </div>

      <!-- STATS ERROR BANNER IF ANY STAT FAILS -->
      <div class="stats-error-banner" *ngIf="accountError || doctorError || specialtyError">
        <div class="banner-left">
          <mat-icon>warning_amber</mat-icon>
          <span>Không thể tải đầy đủ số liệu thống kê từ hệ thống.</span>
        </div>
        <button mat-stroked-button color="warn" (click)="loadStats()" class="retry-btn">
          <mat-icon>refresh</mat-icon>
          <span>Thử lại</span>
        </button>
      </div>

      <!-- STATS GRID -->
      <div class="stats-grid">
        <mat-card class="stat-card stat-accounts">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Tài khoản</span>
              <div class="stat-icon-wrapper"><mat-icon>manage_accounts</mat-icon></div>
            </div>
            <div class="stat-number">
              <span *ngIf="!accountLoading && !accountError">{{ accountCount }}</span>
              <span *ngIf="accountLoading" class="stat-loading-val">...</span>
              <span *ngIf="accountError" class="stat-error-val" title="Không thể tải số liệu">--</span>
            </div>
            <div class="stat-title">Người dùng trong hệ thống</div>
            <div class="stat-footer">
              <a routerLink="/admin/accounts" class="stat-link">Xem danh sách tài khoản →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-doctors">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Đội ngũ y tế</span>
              <div class="stat-icon-wrapper"><mat-icon>medical_services</mat-icon></div>
            </div>
            <div class="stat-number">
              <span *ngIf="!doctorLoading && !doctorError">{{ doctorCount }}</span>
              <span *ngIf="doctorLoading" class="stat-loading-val">...</span>
              <span *ngIf="doctorError" class="stat-error-val" title="Không thể tải số liệu">--</span>
            </div>
            <div class="stat-title">Bác sĩ chuyên khoa công tác</div>
            <div class="stat-footer">
              <a routerLink="/admin/doctors" class="stat-link">Quản lý hồ sơ bác sĩ →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-specialties">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Chuyên khoa</span>
              <div class="stat-icon-wrapper"><mat-icon>local_hospital</mat-icon></div>
            </div>
            <div class="stat-number">
              <span *ngIf="!specialtyLoading && !specialtyError">{{ specialtyCount }}</span>
              <span *ngIf="specialtyLoading" class="stat-loading-val">...</span>
              <span *ngIf="specialtyError" class="stat-error-val" title="Không thể tải số liệu">--</span>
            </div>
            <div class="stat-title">Chuyên khoa hệ thống</div>
            <div class="stat-footer">
              <a routerLink="/admin/specialties" class="stat-link">Quản lý chuyên khoa →</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-appointments">
          <mat-card-content>
            <div class="stat-header">
              <span class="stat-badge">Lịch hẹn</span>
              <div class="stat-icon-wrapper"><mat-icon>event_note</mat-icon></div>
            </div>
            <div class="stat-number">24/7</div>
            <div class="stat-title">Tiếp nhận lịch hẹn trực tuyến</div>
            <div class="stat-footer">
              <a routerLink="/admin/appointments" class="stat-link">Giám sát lịch hẹn →</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- QUICK ACTION TILES -->
      <div class="quick-actions-section">
        <h2 class="section-title">Nghiệp vụ quản trị</h2>
        <div class="action-tiles">
          <a routerLink="/admin/doctors" class="action-tile">
            <div class="tile-icon tile-blue"><mat-icon>medical_services</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Quản lý Bác sĩ</span>
              <span class="tile-sub">Thêm bác sĩ mới, cập nhật chuyên môn và trạng thái nhận lịch</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/admin/specialties" class="action-tile">
            <div class="tile-icon tile-teal"><mat-icon>local_hospital</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Quản lý Chuyên khoa</span>
              <span class="tile-sub">Thiết lập danh mục chuyên khoa và mô tả điều trị</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/admin/accounts" class="action-tile">
            <div class="tile-icon tile-slate"><mat-icon>manage_accounts</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Quản lý Tài khoản</span>
              <span class="tile-sub">Xem danh sách, kiểm tra vai trò người dùng hệ thống</span>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a routerLink="/admin/appointments" class="action-tile">
            <div class="tile-icon tile-indigo"><mat-icon>event_note</mat-icon></div>
            <div class="tile-text">
              <span class="tile-title">Giám sát Lịch hẹn</span>
              <span class="tile-sub">Theo dõi tổng hợp các lượt đăng ký khám trên toàn hệ thống</span>
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
      gap: 24px;
    }

    .dashboard-header-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .header-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 10px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }

    .header-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
      letter-spacing: -0.01em;
    }

    .header-desc {
      font-size: 13px;
      color: #64748b;
      max-width: 600px;
      margin: 0;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }

    .action-btn {
      height: 40px;
      padding: 0 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
    }

    .action-btn-outline {
      height: 40px;
      padding: 0 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
      color: #334155;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      background: #ffffff;

      mat-card-content {
        padding: 20px !important;
        display: flex;
        flex-direction: column;
      }
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .stat-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .stat-icon-wrapper {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }
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
      .stat-badge { background: #f1f5f9; color: #475569; }
      .stat-icon-wrapper { background: #f1f5f9; mat-icon { color: #334155; } }
    }

    .stat-appointments {
      .stat-badge { background: #e0f2fe; color: #0284c7; }
      .stat-icon-wrapper { background: #e0f2fe; mat-icon { color: #0284c7; } }
    }

    .stat-number {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .stat-title {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 14px;
    }

    .stat-footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 10px;
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
      border-radius: 14px;
      padding: 22px 24px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 14px;
    }

    .action-tiles {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .action-tile {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #f1f5f9;
      background: #f8fafc;
      text-decoration: none;
      transition: all 0.15s ease;

      &:hover {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);

        .tile-arrow { transform: translateX(3px); color: #0284c7; }
      }
    }

    .tile-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }

    .tile-blue   { background: #e0f2fe; color: #0284c7; }
    .tile-teal   { background: #ccfbf1; color: #0d9488; }
    .tile-slate  { background: #f1f5f9; color: #475569; }
    .tile-indigo { background: #e0f2fe; color: #0284c7; }

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
      font-size: 18px;
      transition: all 0.15s;
    }

    .stats-error-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      color: #991b1b;
      font-size: 13px;

      .banner-left {
        display: flex;
        align-items: center;
        gap: 8px;
        mat-icon { font-size: 20px; width: 20px; height: 20px; color: #dc2626; }
      }

      .retry-btn {
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        mat-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 4px; }
      }
    }

    .stat-error-val {
      color: #dc2626;
      font-weight: 600;
      font-size: 20px;
    }

    .stat-loading-val {
      color: #94a3b8;
      font-weight: 400;
      letter-spacing: 2px;
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-header-card { flex-direction: column; align-items: flex-start; }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .action-tiles { grid-template-columns: 1fr; }
      .stats-error-banner { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AdminDashboardComponent implements OnInit {
  accountCount: number | null = null;
  doctorCount: number | null = null;
  specialtyCount: number | null = null;

  accountLoading = true;
  doctorLoading = true;
  specialtyLoading = true;

  accountError = false;
  doctorError = false;
  specialtyError = false;

  constructor(
    private adminService: AdminService,
    private specialtyService: SpecialtyService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.accountLoading = true;
    this.accountError = false;
    this.adminService.getAllAccounts().subscribe({
      next: (r) => {
        this.accountCount = r.data?.length ?? 0;
        this.accountLoading = false;
      },
      error: () => {
        this.accountError = true;
        this.accountLoading = false;
      },
    });

    this.specialtyLoading = true;
    this.specialtyError = false;
    this.specialtyService.getAllForAdmin().subscribe({
      next: (r) => {
        this.specialtyCount = r.data?.length ?? 0;
        this.specialtyLoading = false;
      },
      error: () => {
        this.specialtyError = true;
        this.specialtyLoading = false;
      },
    });

    this.doctorLoading = true;
    this.doctorError = false;
    this.doctorService.getAllForAdmin(0, 1).subscribe({
      next: (r) => {
        this.doctorCount = r.data?.totalElements ?? 0;
        this.doctorLoading = false;
      },
      error: () => {
        this.doctorError = true;
        this.doctorLoading = false;
      },
    });
  }
}
