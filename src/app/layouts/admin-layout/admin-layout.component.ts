import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface SidenavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    NgIf,
    NgFor,
  ],
  template: `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          <div class="brand-meta">
            <span class="brand-title">ClinicCare</span>
            <span class="brand-badge">Quản trị hệ thống</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <div class="nav-section-label">CHỨC NĂNG QUẢN LÝ</div>
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="sidebar-item--active"
            class="sidebar-item"
          >
            <mat-icon class="item-icon">{{ item.icon }}</mat-icon>
            <span class="item-label">{{ item.label }}</span>
          </a>

          <div class="nav-section-label portal-label">CHUYỂN GIAO DIỆN</div>
          <a routerLink="/patient/home" class="sidebar-item switch-link" target="_blank" title="Mở cổng bệnh nhân">
            <mat-icon class="item-icon">visibility</mat-icon>
            <span class="item-label">Xem Cổng Bệnh nhân</span>
            <mat-icon class="external-icon">open_in_new</mat-icon>
          </a>
        </nav>

        <!-- User Footer Box -->
        <div class="sidebar-footer">
          <div class="user-profile-box" *ngIf="currentUser">
            <div class="user-avatar-admin">
              {{ getInitials(currentUser.fullName || currentUser.username) }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ currentUser.fullName || currentUser.username }}</span>
              <span class="user-role">Quản trị viên</span>
            </div>
          </div>
          <button
            mat-icon-button
            (click)="logout()"
            class="logout-icon-btn"
            matTooltip="Đăng xuất khỏi hệ thống"
            aria-label="Đăng xuất"
          >
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="main-wrapper">
        <!-- TOP HEADER -->
        <header class="main-header">
          <div class="header-left">
            <span class="header-breadcrumb">Hệ thống Quản trị Bệnh viện & Đặt lịch khám</span>
          </div>

          <div class="header-actions">
            <!-- Button link sang cổng Patient -->
            <button mat-stroked-button routerLink="/patient/home" class="btn-patient-view">
              <mat-icon>storefront</mat-icon>
              <span>Xem Cổng Bệnh nhân</span>
            </button>

            <!-- User Menu -->
            <button
              type="button"
              [matMenuTriggerFor]="userMenu"
              class="admin-header-chip"
              aria-label="Menu tài khoản"
            >
              <div class="chip-avatar">{{ getInitials(currentUser?.fullName || currentUser?.username) }}</div>
              <span class="chip-name">{{ currentUser?.fullName || currentUser?.username }}</span>
              <mat-icon class="chip-arrow">expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <div class="dropdown-header" *ngIf="currentUser">
                <p class="dropdown-user">{{ currentUser.fullName || currentUser.username }}</p>
                <p class="dropdown-email">{{ currentUser.email }}</p>
                <span class="dropdown-badge">Quyền: Quản trị viên (Super Admin)</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/patient/home">
                <mat-icon color="primary">home</mat-icon>
                <span>Vào Cổng Bệnh nhân</span>
              </button>
              <button mat-menu-item routerLink="/admin/accounts">
                <mat-icon color="primary">manage_accounts</mat-icon>
                <span>Quản lý tài khoản</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon color="warn">logout</mat-icon>
                <span>Đăng xuất</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* SIDEBAR */
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background: #0f172a; /* Slate 900 */
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 100;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);

      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      color: #ffffff;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .brand-badge {
      display: inline-block;
      color: #f87171;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 18px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.08em;
      padding: 12px 14px 6px;

      &.portal-label {
        margin-top: 18px;
      }
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;

      .item-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
        transition: color 0.2s;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        .item-icon { color: #f87171; }
      }

      &.sidebar-item--active {
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
        color: #ffffff;
        border-left: 3px solid #ef4444;

        .item-icon { color: #ef4444; }
      }

      &.switch-link {
        color: #38bdf8;
        .item-icon { color: #38bdf8; }
        .external-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-left: auto;
          color: #64748b;
        }

        &:hover {
          background: rgba(56, 189, 248, 0.1);
          color: #7dd3fc;
        }
      }
    }

    .sidebar-footer {
      padding: 16px 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-profile-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .user-avatar-admin {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      flex-shrink: 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      color: #f87171;
      font-size: 11px;
      font-weight: 600;
    }

    .logout-icon-btn {
      color: #94a3b8;
      &:hover { color: #ef4444; }
    }

    /* MAIN WRAPPER */
    .main-wrapper {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-header {
      height: 70px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }

    .header-breadcrumb {
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .btn-patient-view {
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #0284c7;
      border-color: #bae6fd;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: #f0f9ff;
      }
    }

    .admin-header-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 4px 12px 4px 6px;
      border-radius: 9999px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    .chip-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #ef4444;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
    }

    .chip-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .chip-arrow {
      color: #94a3b8;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .dropdown-header {
      padding: 12px 16px 10px;
    }

    .dropdown-user {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .dropdown-email {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 6px;
    }

    .dropdown-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: #b91c1c;
      background: #fee2e2;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .main-content {
      flex: 1;
      padding: 32px;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-wrapper { margin-left: 0; }
      .main-header { padding: 0 16px; }
      .main-content { padding: 20px 16px; }
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;

  readonly navItems: SidenavItem[] = [
    { label: 'Tổng quan Dashboard',  route: '/admin/dashboard',    icon: 'dashboard' },
    { label: 'Quản lý Tài khoản',    route: '/admin/accounts',     icon: 'manage_accounts' },
    { label: 'Quản lý Bác sĩ',       route: '/admin/doctors',      icon: 'medical_services' },
    { label: 'Quản lý Chuyên khoa',  route: '/admin/specialties',  icon: 'local_hospital' },
    { label: 'Quản lý Lịch hẹn',     route: '/admin/appointments', icon: 'event_note' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'AD';
    return name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
