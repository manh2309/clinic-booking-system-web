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
import { User } from '../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [
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

            <!-- Notifications -->
            <button
              mat-icon-button
              routerLink="/patient/notifications"
              class="notif-btn"
              aria-label="Thông báo"
            >
              <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn">
                notifications
              </mat-icon>
            </button>

            <!-- User Menu -->
            <button
              mat-button
              [matMenuTriggerFor]="userMenu"
              class="user-menu-btn"
              aria-label="Menu tài khoản"
            >
              <div class="user-avatar" *ngIf="currentUser">
                <span>{{ getInitials(currentUser.fullName) }}</span>
              </div>
              <div class="user-info" *ngIf="currentUser">
                <span class="user-name">{{ currentUser.fullName }}</span>
                <span class="user-role">Bệnh nhân</span>
              </div>
              <mat-icon class="arrow-icon">expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="premium-menu">
              <div class="menu-header" *ngIf="currentUser">
                <p class="menu-name">{{ currentUser.fullName }}</p>
                <p class="menu-email">{{ currentUser.email }}</p>
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

      <!-- PROFESSIONAL FOOTER -->
      <footer class="patient-footer">
        <div class="footer-container">
          <div class="footer-col brand-col">
            <div class="footer-brand">
              <div class="brand-icon small">
                <mat-icon>local_hospital</mat-icon>
              </div>
              <span class="brand-name">ClinicCare</span>
            </div>
            <p class="footer-desc">
              Hệ thống đặt lịch khám bệnh trực tuyến hàng đầu, kết nối người bệnh với đội ngũ bác sĩ chuyên khoa giỏi và các bệnh viện uy tín.
            </p>
            <div class="footer-hotline">
              <mat-icon>support_agent</mat-icon>
              <div>
                <span class="label">Tổng đài hỗ trợ 24/7</span>
                <span class="phone">1900 6868</span>
              </div>
            </div>
          </div>

          <div class="footer-col">
            <h4>Dịch vụ y tế</h4>
            <ul>
              <li><a routerLink="/patient/doctors">Đặt lịch khám chuyên khoa</a></li>
              <li><a routerLink="/patient/home">Tư vấn sức khỏe trực tuyến</a></li>
              <li><a routerLink="/patient/appointments">Theo dõi lịch khám cá nhân</a></li>
              <li><a routerLink="/patient/medical-records">Hồ sơ bệnh án điện tử</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Thông tin phòng khám</h4>
            <ul>
              <li><mat-icon class="icon-inline">place</mat-icon> Số 123 Đường Cầu Giấy, Hà Nội</li>
              <li><mat-icon class="icon-inline">schedule</mat-icon> Thứ 2 - Chủ Nhật: 07:30 - 20:00</li>
              <li><mat-icon class="icon-inline">email</mat-icon> hotro&#64;cliniccare.vn</li>
            </ul>
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

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .user-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .user-role {
      font-size: 11px;
      color: #0284c7;
      font-weight: 600;
    }

    .arrow-icon {
      color: #94a3b8;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* DROPDOWN MENU */
    .menu-header {
      padding: 12px 16px 8px;
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

    /* PROFESSIONAL FOOTER */
    .patient-footer {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      margin-top: 48px;
      color: #475569;
    }

    .footer-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 48px 24px 32px;
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.5fr;
      gap: 40px;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .footer-desc {
      font-size: 13px;
      line-height: 1.7;
      color: #64748b;
      max-width: 420px;
      margin-bottom: 20px;
    }

    .footer-hotline {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #0284c7;
      }

      .label {
        display: block;
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
      }

      .phone {
        display: block;
        font-size: 18px;
        font-weight: 800;
        color: #0284c7;
        line-height: 1.2;
      }
    }

    .footer-col h4 {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
    }

    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;

      li {
        font-size: 13px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;

        a {
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;

          &:hover {
            color: #0284c7;
          }
        }
      }
    }

    .icon-inline {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #0284c7;
    }

    .footer-bottom {
      border-top: 1px solid #f1f5f9;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 992px) {
      .footer-container {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .quick-book-btn {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .navbar-nav { display: none; }
      .user-info { display: none; }
      .brand-tag { display: none; }
      .patient-navbar { height: 64px; }
      .patient-main { padding: 20px 16px; }
    }
  `],
})
export class PatientLayoutComponent implements OnInit {
  currentUser: User | null = null;
  unreadCount = 0;

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
