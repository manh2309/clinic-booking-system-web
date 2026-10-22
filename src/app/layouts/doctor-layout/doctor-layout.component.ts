import { WorkspaceMenuComponent } from '../../shared/components/workspace-menu/workspace-menu.component';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
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
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [
    WorkspaceMenuComponent,
    NotificationBellComponent,
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
    <div class="doctor-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <!-- Brand -->
        <div class="sidebar-brand">
          <div class="brand-icon">
            <mat-icon>medical_services</mat-icon>
          </div>
          <div class="brand-meta">
            <span class="brand-title">ClinicCare</span>
            <span class="brand-badge">Bác sĩ phụ trách</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <div class="nav-section-label">CHỨC NĂNG BÁC SĨ</div>
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="sidebar-item--active"
            class="sidebar-item"
          >
            <mat-icon class="item-icon">{{ item.icon }}</mat-icon>
            <span class="item-label">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Doctor Footer Box -->
        <div class="sidebar-footer">
          <div class="user-profile-box" *ngIf="currentUser">
            <div class="user-avatar-doc">
              {{ getInitials(currentUser.fullName || currentUser.username) }}
            </div>
            <div class="user-meta">
              <span class="user-name">{{ currentUser.fullName || currentUser.username }}</span>
              <span class="user-role">Bác sĩ</span>
            </div>
          </div>
          <button
            mat-icon-button
            (click)="logout()"
            class="logout-icon-btn"
            matTooltip="Đăng xuất"
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
            <app-workspace-menu [items]="navItems"></app-workspace-menu>
            <span class="header-breadcrumb">Bàn làm việc bác sĩ</span>
          </div>

          <div class="header-actions">
            <app-notification-bell route="/doctor/notifications"></app-notification-bell>
            <!-- User Chip Button -->
            <button
              type="button"
              [matMenuTriggerFor]="userMenu"
              class="doc-header-chip"
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
                <span class="dropdown-badge">Bác sĩ</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/doctor/schedule">
                <mat-icon color="primary">calendar_month</mat-icon>
                <span>Lịch làm việc</span>
              </button>
              <button mat-menu-item routerLink="/doctor/profile">
                <mat-icon color="primary">badge</mat-icon>
                <span>Hồ sơ chuyên môn</span>
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
    .doctor-layout {
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
      box-shadow: 2px 0 12px rgba(15, 23, 42, 0.08);
      border-right: 1px solid #1e293b;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 22px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      color: #ffffff;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .brand-badge {
      display: inline-block;
      color: #5eead4;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-top: 2px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.06em;
      padding: 12px 14px 6px;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;

      .item-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748b;
        transition: color 0.15s;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        .item-icon { color: #5eead4; }
      }

      &.sidebar-item--active {
        background: rgba(13, 148, 136, 0.15);
        color: #ffffff;
        border-left: 3px solid #0d9488;
        font-weight: 600;

        .item-icon { color: #5eead4; }
      }
    }

    .sidebar-footer {
      padding: 14px 18px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.15);
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

    .user-avatar-doc {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0d9488;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
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
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      color: #94a3b8;
      font-size: 11px;
      font-weight: 500;
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
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-breadcrumb {
      font-size: 14px;
      font-weight: 600;
      color: #0f766e;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .doc-header-chip {
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
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #0d9488;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }

    .chip-name {
      font-size: 13px;
      font-weight: 600;
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
      font-weight: 600;
      color: #0f766e;
      background: #ccfbf1;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .main-content {
      flex: 1;
      padding: 28px 32px;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-wrapper { margin-left: 0; }
      .main-header { padding: 0 12px; gap:8px; }
      .header-left { display:flex; align-items:center; min-width:0; }
      .header-breadcrumb { display:none; }
      .header-actions { gap:4px; }
      .main-content { padding: 20px 16px; }
    }
  `],
})
export class DoctorLayoutComponent implements OnInit {
  currentUser: User | null = null;

  readonly navItems: SidenavItem[] = [
    { label: 'Tổng quan',     route: '/doctor/dashboard',    icon: 'dashboard' },
    { label: 'Lịch làm việc', route: '/doctor/schedule',     icon: 'calendar_month' },
    {label:'Đơn nghỉ',route:'/doctor/leaves',icon:'event_busy'},
    { label: 'Lịch hẹn',      route: '/doctor/appointments', icon: 'pending_actions' },
    { label: 'Thông báo', route: '/doctor/notifications', icon: 'notifications' },
    { label: 'Hồ sơ',         route: '/doctor/profile',      icon: 'badge' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'BS';
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
