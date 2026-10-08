import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
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
    NgIf,
  ],
  template: `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="sidebar-logo">🏥</span>
          <div>
            <div class="sidebar-title">Clinic Booking</div>
            <div class="sidebar-badge">Admin Panel</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="sidebar-item--active"
            class="sidebar-item"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user" *ngIf="currentUser">
            <div class="sidebar-avatar">
              {{ getInitials(currentUser.fullName) }}
            </div>
            <div class="sidebar-user-info">
              <span class="sidebar-user-name">{{ currentUser.fullName }}</span>
              <span class="sidebar-user-role">Quản trị viên</span>
            </div>
          </div>
          <button mat-icon-button (click)="logout()" title="Đăng xuất" aria-label="Đăng xuất">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-wrapper">
        <header class="main-header">
          <div class="header-spacer"></div>
          <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="Menu người dùng">
            <div class="header-avatar" *ngIf="currentUser">
              {{ getInitials(currentUser.fullName) }}
            </div>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Đăng xuất
            </button>
          </mat-menu>
        </header>

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
      background: #f5f7fa;
    }

    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #212121;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 100;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .sidebar-logo { font-size: 28px; }

    .sidebar-title {
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
    }

    .sidebar-badge {
      display: inline-block;
      background: #ef5350;
      color: #ffffff;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;

      mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }

      &:hover {
        background: rgba(255,255,255,0.08);
        color: #ffffff;
      }

      &.sidebar-item--active {
        background: rgba(255,255,255,0.12);
        color: #ffffff;
        border-left: 3px solid #ef5350;
        padding-left: 11px;
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sidebar-user {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .sidebar-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ef5350;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .sidebar-user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-user-name {
      color: #ffffff;
      font-size: 13px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar-user-role {
      color: rgba(255,255,255,0.5);
      font-size: 11px;
    }

    .main-wrapper {
      flex: 1;
      margin-left: 240px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-header {
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e8ecf0;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 8px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .header-spacer { flex: 1; }

    .header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ef5350;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .main-content {
      flex: 1;
      padding: 24px;
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;

  readonly navItems: SidenavItem[] = [
    { label: 'Dashboard',     route: '/admin/dashboard',    icon: 'dashboard' },
    { label: 'Tài khoản',     route: '/admin/accounts',     icon: 'manage_accounts' },
    { label: 'Bác sĩ',       route: '/admin/doctors',      icon: 'medical_services' },
    { label: 'Chuyên khoa',  route: '/admin/specialties',  icon: 'local_hospital' },
    { label: 'Lịch hẹn',     route: '/admin/appointments', icon: 'event_note' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getInitials(name?: string): string {
    if (!name) return 'AD';
    return name.trim().split(/\s+/).map((p) => p[0]).slice(-2).join('').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
