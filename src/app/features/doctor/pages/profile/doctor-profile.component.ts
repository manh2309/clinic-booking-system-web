import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [MatCardModule, MatIconModule, NgIf, PageHeaderComponent],
  template: `
    <div class="fade-in">
      <app-page-header
        title="Hồ sơ chuyên môn"
        subtitle="Thông tin chuyên khoa và danh mục hoạt động chuyên môn"
      ></app-page-header>

      <!-- Account Summary Card -->
      <mat-card class="profile-card" *ngIf="currentUser">
        <mat-card-content>
          <div class="doctor-profile-header">
            <div class="doctor-avatar">
              {{ getInitials(currentUser.fullName || currentUser.username) }}
            </div>
            <div class="doctor-basic">
              <h2 class="doctor-name">{{ currentUser.fullName || currentUser.username }}</h2>
              <span class="doctor-badge">Bác sĩ khám bệnh</span>
              <p class="doctor-email">
                <mat-icon class="icon-sm">mail</mat-icon>
                <span>{{ currentUser.email }}</span>
              </p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- In-Development Details Card -->
      <mat-card class="in-dev-card">
        <mat-card-content>
          <div class="in-dev-content">
            <span class="in-dev-badge">Tính năng đang phát triển</span>
            <h3 class="in-dev-title">Cập nhật Chi tiết Hồ sơ chuyên môn</h3>
            <p class="in-dev-desc">
              Chức năng cho phép bác sĩ tự chỉnh sửa giới thiệu kinh nghiệm, chứng chỉ hành nghề và đổi mật khẩu đang trong quá trình hoàn thiện.
            </p>
            <div class="planned-items">
              <div class="item">
                <mat-icon class="check">pending</mat-icon>
                <span>Tự cập nhật mô tả kinh nghiệm và bằng cấp chuyên khoa</span>
              </div>
              <div class="item">
                <mat-icon class="check">pending</mat-icon>
                <span>Đổi mật khẩu và cài đặt thông tin liên hệ phòng khám</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-card {
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      background: #ffffff !important;
      margin-bottom: 20px;
    }
    .profile-card mat-card-content {
      padding: 24px !important;
    }
    .doctor-profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .doctor-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #0d9488;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .doctor-basic {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .doctor-name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .doctor-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #0f766e;
      background: #ccfbf1;
      padding: 2px 8px;
      border-radius: 6px;
      width: fit-content;
    }
    .doctor-email {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
      .icon-sm { font-size: 16px; width: 16px; height: 16px; }
    }
    .in-dev-card {
      border-radius: 14px !important;
      border: 1px dashed #cbd5e1 !important;
      background: #f8fafc !important;
      box-shadow: none !important;
    }
    .in-dev-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      text-align: center;
      max-width: 540px;
      margin: 0 auto;
    }
    .in-dev-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 10px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }
    .in-dev-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .in-dev-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .planned-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
      width: 100%;
      background: #ffffff;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #475569;
      .check { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
    }
  `],
})
export class DoctorProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => {
      this.currentUser = u;
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
}
