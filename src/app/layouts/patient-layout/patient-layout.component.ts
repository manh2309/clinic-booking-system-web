import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
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
  ],
  template: `
    <div class="patient-layout">
      <!-- TOP NAVBAR -->
      <mat-toolbar class="patient-navbar" color="primary">
        <div class="navbar-brand">
          <span class="navbar-logo">🏥</span>
          <span class="navbar-title">Clinic Booking</span>
        </div>

        <!-- Navigation Links (desktop) -->
        <nav class="navbar-nav">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="nav-link--active"
            class="nav-link"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            {{ item.label }}
          </a>
        </nav>

        <span class="spacer"></span>

        <!-- Notification Bell -->
        <button mat-icon-button [routerLink]="'/patient/notifications'" aria-label="Thông báo">
          <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn">
            notifications
          </mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn" aria-label="Menu người dùng">
          <div class="user-avatar" *ngIf="currentUser">
            <span>{{ getInitials(currentUser.fullName) }}</span>
          </div>
          <span class="user-name" *ngIf="currentUser">{{ currentUser.fullName }}</span>
          <mat-icon>keyboard_arrow_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item [routerLink]="'/patient/profile'">
            <mat-icon>person</mat-icon>
            Hồ sơ cá nhân
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Đăng xuất
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- MAIN CONTENT -->
      <main class="patient-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .patient-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .patient-navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #1565c0 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 0 24px;
      height: 64px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-right: 32px;
    }

    .navbar-logo {
      font-size: 24px;
    }

    .navbar-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.3px;
      white-space: nowrap;
    }

    .navbar-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }

      &:hover {
        background: rgba(255,255,255,0.12);
        color: #ffffff;
      }

      &.nav-link--active {
        background: rgba(255,255,255,0.2);
        color: #ffffff;
      }
    }

    .spacer {
      flex: 1;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff !important;
      border-radius: 8px;
      padding: 4px 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .patient-main {
      flex: 1;
      padding: 24px;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .navbar-nav { display: none; }
      .user-name  { display: none; }
      .patient-navbar { padding: 0 12px; }
      .patient-main   { padding: 16px; }
    }
  `],
})
export class PatientLayoutComponent implements OnInit {
  currentUser: User | null = null;
  unreadCount = 0;

  readonly navItems: NavItem[] = [
    { label: 'Trang chủ',   route: '/patient/home',            icon: 'home' },
    { label: 'Bác sĩ',     route: '/patient/doctors',         icon: 'medical_services' },
    { label: 'Lịch hẹn',   route: '/patient/appointments',   icon: 'calendar_today' },
    { label: 'Hồ sơ bệnh', route: '/patient/medical-records', icon: 'folder_shared' },
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
