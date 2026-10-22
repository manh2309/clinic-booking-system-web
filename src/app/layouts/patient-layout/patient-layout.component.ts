import { WorkspaceMenuComponent } from '../../shared/components/workspace-menu/workspace-menu.component';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User, Role } from '../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-patient-layout',
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
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    NgIf,
    NgFor,
  ],
  template: `
    <div class="patient-layout">
      <!-- TOP NAVBAR -->
      <header class="patient-navbar">
        <div class="navbar-container">
          <!-- Brand Logo -->
          <a routerLink="/patient/home" class="navbar-brand">
            <div class="brand-icon">
              <mat-icon>local_hospital</mat-icon>
            </div>
            <div class="brand-text">
              <span class="brand-name">ClinicCare</span>
              <span class="brand-tag">Hệ thống Y tế số</span>
            </div>
          </a>

          <!-- Navigation Links (desktop) -->
          <nav class="navbar-nav">
            <a
              *ngFor="let item of navItems"
              [routerLink]="item.route"
              routerLinkActive="nav-link--active"
              class="nav-link"
            >
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          </nav>

          <app-workspace-menu [items]="navItems"></app-workspace-menu>
          <span class="spacer"></span>

          <!-- Actions -->
          <div class="navbar-actions">
            <!-- Quick Booking Button -->
            <button
              mat-flat-button
              color="primary"
              routerLink="/patient/doctors"
              class="quick-book-btn"
            >
              <mat-icon>add_circle_outline</mat-icon>
              <span>Đặt khám ngay</span>
            </button>

            <app-notification-bell route="/patient/notifications"></app-notification-bell>

            <!-- User Menu Chip (Fixed layout & positioning) -->
            <button
              type="button"
              [matMenuTriggerFor]="userMenu"
              class="user-chip-btn"
              aria-label="Menu tài khoản"
            >
              <div class="user-avatar" *ngIf="currentUser">
                <span>{{ getInitials(currentUser.fullName) }}</span>
              </div>
              <div class="user-info" *ngIf="currentUser">
                <span class="user-name">{{ currentUser.fullName || currentUser.username }}</span>
                <span class="user-role" [class]="'role-' + currentUser.role.toLowerCase()">
                  {{ getRoleLabel(currentUser.role) }}
                </span>
              </div>
              <mat-icon class="arrow-icon">expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="premium-menu">
              <div class="menu-header" *ngIf="currentUser">
                <p class="menu-name">{{ currentUser.fullName || currentUser.username }}</p>
                <p class="menu-email">{{ currentUser.email }}</p>
                <span class="menu-role-tag" [class]="'tag-' + currentUser.role.toLowerCase()">
                  {{ getRoleLabel(currentUser.role) }}
                </span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/patient/profile">
                <mat-icon color="primary">account_circle</mat-icon>
                <span>Hồ sơ cá nhân</span>
              </button>
              <button mat-menu-item routerLink="/patient/appointments">
                <mat-icon color="primary">calendar_today</mat-icon>
                <span>Lịch hẹn của tôi</span>
              </button>
              <button mat-menu-item routerLink="/patient/medical-records">
                <mat-icon color="primary">folder_shared</mat-icon>
                <span>Lịch sử khám bệnh</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="logout-item">
                <mat-icon color="warn">logout</mat-icon>
                <span>Đăng xuất</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="patient-main">
        <router-outlet></router-outlet>
      </main>

      <!-- COMPACT FOOTER -->
      <footer class="patient-footer">
        <div class="footer-container">
          <div class="footer-brand-wrap">
            <div class="footer-brand">
              <div class="brand-icon small">
                <mat-icon>local_hospital</mat-icon>
              </div>
              <span class="brand-name">ClinicCare</span>
            </div>
            <p class="footer-desc">
              Hệ thống đặt lịch khám bệnh trực tuyến — Kết nối bệnh nhân với bác sĩ chuyên khoa.
            </p>
          </div>

          <div class="footer-links">
            <a routerLink="/patient/home">Trang chủ</a>
            <a routerLink="/patient/doctors">Tìm bác sĩ</a>
            <a routerLink="/patient/appointments">Lịch hẹn của tôi</a>
            <a routerLink="/patient/medical-records">Hồ sơ bệnh án</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 ClinicCare Medical System. Đồ án tốt nghiệp CNTT — Hệ thống đặt lịch khám bệnh.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .patient-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 320px, #f8fafc 100%);
    }

    /* HEADER & NAVBAR */
    .patient-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.85);
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
      height: 72px;
      display: flex;
      align-items: center;
    }

    .navbar-container {
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* BRAND LOGO */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      margin-right: 20px;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);

      mat-icon {
        color: #ffffff;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      &.small {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }

    .brand-tag {
      font-size: 11px;
      color: #0284c7;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* NAV LINKS */
    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 10px;
      color: #475569;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;

      .nav-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
        color: #64748b;
        transition: color 0.2s;
      }

      &:hover {
        background: #f1f5f9;
        color: #0284c7;

        .nav-icon { color: #0284c7; }
      }

      &.nav-link--active {
        background: #e0f2fe;
        color: #0284c7;

        .nav-icon { color: #0284c7; }
      }
    }

    .spacer {
      flex: 1;
    }

    /* RIGHT ACTIONS */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quick-book-btn {
      height: 40px;
      padding: 0 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .notif-btn {
      color: #475569;
    }

    .user-chip-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 5px 14px 5px 6px;
      border-radius: 9999px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      outline: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);

      &:hover {
        background: #f8fafc;
        border-color: #38bdf8;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);
      }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2);
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      line-height: 1.25;
    }

    .user-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    .user-role {
      font-size: 11px;
      font-weight: 700;
      display: block;

      &.role-admin { color: #dc2626; }
      &.role-doctor { color: #0d9488; }
      &.role-patient { color: #0284c7; }
    }

    .arrow-icon {
      color: #64748b;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-left: 2px;
    }

    /* DROPDOWN MENU */
    .menu-header {
      padding: 12px 16px 10px;
    }

    .menu-role-tag {
      display: inline-block;
      margin-top: 6px;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;

      &.tag-admin { background: #fee2e2; color: #b91c1c; }
      &.tag-doctor { background: #ccfbf1; color: #0f766e; }
      &.tag-patient { background: #e0f2fe; color: #0369a1; }
    }

    .portal-switch-item {
      background: #f8fafc;
      &:hover { background: #f1f5f9; }
    }

    .menu-name {
      font-weight: 700;
      font-size: 14px;
      margin: 0;
      color: #0f172a;
    }

    .menu-email {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0;
    }

    /* MAIN CONTENT WRAPPER */
    .patient-main {
      flex: 1;
      padding: 32px 24px;
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    /* COMPACT FOOTER */
    .patient-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      margin-top: 48px;
      color: #64748b;
    }

    .footer-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .footer-brand-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-desc {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 20px;

      a {
        font-size: 13px;
        font-weight: 500;
        color: #475569;
        text-decoration: none;
        transition: color 0.15s;

        &:hover {
          color: #0284c7;
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid #f1f5f9;
      padding: 12px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column;
        align-items: flex-start;
      }
      .footer-links {
        flex-wrap: wrap;
        gap: 12px;
      }
      .navbar-nav { display: none; }
      .user-info { display: none; }
      .brand-tag { display: none; }
      .brand-text { display:none; }
      .navbar-container { gap:4px; }
      .navbar-actions { gap:4px; }
      .patient-navbar { height: 64px; }
      .patient-main { padding: 20px 16px; }
    }
  `],
})
export class PatientLayoutComponent implements OnInit {
  readonly Role = Role;
  currentUser: User | null = null;


  readonly navItems: NavItem[] = [
    { label: 'Trang chủ',   route: '/patient/home',            icon: 'home' },
    { label: 'Tìm bác sĩ', route: '/patient/doctors',         icon: 'medical_services' },
    { label: 'Lịch khám',   route: '/patient/appointments',   icon: 'calendar_today' },
    { label: 'Hồ sơ bệnh án', route: '/patient/medical-records', icon: 'folder_shared' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getRoleLabel(role?: Role): string {
    if (!role) return 'Bệnh nhân';
    if (role === Role.ADMIN) return 'Quản trị viên';
    if (role === Role.DOCTOR) return 'Bác sĩ';
    return 'Bệnh nhân';
  }

  getInitials(name?: string): string {
    if (!name) return 'BN';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
