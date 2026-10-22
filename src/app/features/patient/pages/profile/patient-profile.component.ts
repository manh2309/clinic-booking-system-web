import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { PatientProfileService } from '../../../../core/services/patient-profile.service';
import { PatientProfileResponse, PatientProfileRequest } from '../../../../core/models/domain.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    NgIf,
    LoadingComponent,
  ],
  template: `
    <div class="profile-page-wrapper fade-in">
      <!-- HERO BANNER -->
      <section class="profile-hero-banner">
        <div class="banner-container">
          <div class="banner-text">
            <div class="banner-badge">
              <mat-icon>verified</mat-icon>
              <span>Hồ sơ y tế bảo mật</span>
            </div>
            <h1 class="banner-title">Hồ sơ cá nhân & Y tế</h1>
            <p class="banner-desc">
              Cập nhật thông tin chính xác để phòng khám liên hệ nhắc lịch và lập bệnh án khám chữa bệnh.
            </p>
          </div>

          <div class="banner-stats">
            <div class="stat-card">
              <div class="stat-icon-wrap primary">
                <mat-icon>badge</mat-icon>
              </div>
              <div class="stat-meta">
                <span class="stat-label">Mã bệnh nhân</span>
                <span class="stat-value">#BN-{{ profile?.patientProfileId || '2026' }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap success">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-meta">
                <span class="stat-label">Tài khoản</span>
                <span class="stat-value success-text">Đã kích hoạt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <app-loading *ngIf="isLoading" message="Đang tải dữ liệu hồ sơ y tế..."></app-loading>

      <!-- ERROR BANNER -->
      <div class="error-banner" *ngIf="!isLoading && hasError">
        <mat-icon class="err-icon">error_outline</mat-icon>
        <div class="err-text">
          <strong>Không thể tải hồ sơ cá nhân</strong>
          <p>{{ errorMessage }}</p>
        </div>
        <button mat-flat-button color="primary" (click)="loadProfile()">
          <mat-icon>refresh</mat-icon>
          <span>Thử lại</span>
        </button>
      </div>

      <!-- MAIN TWO-COLUMN LAYOUT -->
      <div class="profile-layout" *ngIf="!isLoading && !hasError">
        <!-- LEFT COLUMN: Patient Info & Quick Links -->
        <aside class="profile-sidebar">
          <!-- Avatar Identity Card -->
          <mat-card class="identity-card">
            <div class="avatar-wrapper">
              <div class="avatar-ring">
                <div class="avatar-circle">
                  <span>{{ getInitials() }}</span>
                </div>
              </div>
              <div class="avatar-verified-badge" title="Tài khoản đã xác minh">
                <mat-icon>verified</mat-icon>
              </div>
            </div>

            <h2 class="patient-name">{{ profile?.fullName || currentUser?.username || 'Bệnh nhân' }}</h2>
            <p class="patient-email">{{ profile?.email || currentUser?.email }}</p>

            <div class="patient-role-tag">
              <mat-icon>medical_services</mat-icon>
              <span>Bệnh nhân ClinicCare</span>
            </div>

            <mat-divider class="card-divider"></mat-divider>

            <!-- Quick Navigation Menu -->
            <div class="sidebar-menu">
              <a class="menu-item active">
                <mat-icon>person</mat-icon>
                <span>Thông tin cá nhân</span>
                <mat-icon class="arrow">chevron_right</mat-icon>
              </a>
              <a routerLink="/patient/appointments" class="menu-item">
                <mat-icon>calendar_today</mat-icon>
                <span>Lịch hẹn của tôi</span>
                <mat-icon class="arrow">chevron_right</mat-icon>
              </a>
              <a routerLink="/patient/medical-records" class="menu-item">
                <mat-icon>folder_shared</mat-icon>
                <span>Lịch sử khám bệnh</span>
                <mat-icon class="arrow">chevron_right</mat-icon>
              </a>
              <a routerLink="/patient/doctors" class="menu-item">
                <mat-icon>search</mat-icon>
                <span>Tìm & Đặt khám bác sĩ</span>
                <mat-icon class="arrow">chevron_right</mat-icon>
              </a>
            </div>
          </mat-card>

          <!-- Emergency Support Card -->
          <div class="support-card">
            <div class="support-header">
              <div class="support-icon">
                <mat-icon>support_agent</mat-icon>
              </div>
              <div>
                <h4 class="support-title">Hỗ trợ y tế 24/7</h4>
                <p class="support-sub">Tư vấn đặt lịch & cấp cứu</p>
              </div>
            </div>
            <a href="tel:19006868" class="support-phone">
              <mat-icon>call</mat-icon>
              <span>1900 6868</span>
            </a>
          </div>
        </aside>

        <!-- RIGHT COLUMN: Edit Profile Form -->
        <main class="profile-content">
          <mat-card class="form-container-card">
            <div class="form-card-header">
              <div class="header-icon">
                <mat-icon>edit_note</mat-icon>
              </div>
              <div>
                <h3 class="header-title">Chi tiết thông tin cá nhân</h3>
                <p class="header-subtitle">Vui lòng điền thông tin chính xác theo giấy tờ tùy thân (CCCD / BHYT)</p>
              </div>
            </div>

            <p *ngIf="!profile?.patientProfileId" role="status">Bạn chưa hoàn thiện hồ sơ. Hãy bổ sung họ tên và kiểm tra thông tin liên hệ.</p>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <!-- SECTION 1: Thông tin định danh -->
              <div class="form-section">
                <div class="section-badge">
                  <mat-icon>badge</mat-icon>
                  <span>1. Thông tin định danh</span>
                </div>

                <div class="form-grid">
                  <!-- Họ và tên -->
                  <mat-form-field appearance="outline" class="form-field-item full-span">
                    <mat-label>Họ và tên đầy đủ</mat-label>
                    <input
                      matInput
                      formControlName="fullName"
                      placeholder="Ví dụ: Nguyễn Văn Test 3"
                    />
                    <mat-icon matPrefix class="field-icon">person</mat-icon>
                    <mat-error *ngIf="profileForm.get('fullName')?.hasError('required')">
                      Họ và tên là bắt buộc
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('fullName')?.hasError('minlength')">
                      Họ và tên tối thiểu 4 ký tự
                    </mat-error>
                  </mat-form-field>

                  <!-- Ngày sinh -->
                  <mat-form-field appearance="outline" class="form-field-item">
                    <mat-label>Ngày sinh</mat-label>
                    <input matInput type="date" formControlName="dateOfBirth" />
                    <mat-icon matPrefix class="field-icon">calendar_month</mat-icon>
                    <mat-hint>Định dạng: Ngày / Tháng / Năm</mat-hint>
                  </mat-form-field>

                  <!-- Giới tính -->
                  <mat-form-field appearance="outline" class="form-field-item">
                    <mat-label>Giới tính</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="MALE">Nam</mat-option>
                      <mat-option value="FEMALE">Nữ</mat-option>
                      <mat-option value="OTHER">Khác</mat-option>
                    </mat-select>
                    <mat-icon matPrefix class="field-icon">wc</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider class="section-divider"></mat-divider>

              <!-- SECTION 2: Thông tin liên lạc -->
              <div class="form-section">
                <div class="section-badge">
                  <mat-icon>contact_mail</mat-icon>
                  <span>2. Thông tin liên lạc & Địa chỉ</span>
                </div>

                <div class="form-grid">
                  <!-- Email -->
                  <mat-form-field appearance="outline" class="form-field-item">
                    <mat-label>Địa chỉ Email</mat-label>
                    <input
                      matInput
                      type="email"
                      formControlName="email"
                      placeholder="example@gmail.com"
                    />
                    <mat-icon matPrefix class="field-icon">mail</mat-icon>
                    <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                      Email là bắt buộc
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                      Email không đúng định dạng
                    </mat-error>
                  </mat-form-field>

                  <!-- Số điện thoại -->
                  <mat-form-field appearance="outline" class="form-field-item">
                    <mat-label>Số điện thoại liên hệ</mat-label>
                    <input
                      matInput
                      formControlName="phone"
                      placeholder="Ví dụ: 0962964504"
                    />
                    <mat-icon matPrefix class="field-icon">phone</mat-icon>
                    <mat-hint>Dùng để nhận SMS nhắc lịch khám</mat-hint>
                  </mat-form-field>

                  <!-- Địa chỉ cư trú -->
                  <mat-form-field appearance="outline" class="form-field-item full-span">
                    <mat-label>Địa chỉ nơi cư trú</mat-label>
                    <input
                      matInput
                      formControlName="address"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                    <mat-icon matPrefix class="field-icon">home</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <!-- PRIVACY NOTICE -->
              <div class="privacy-notice">
                <mat-icon>shield</mat-icon>
                <span>Thông tin cá nhân được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn an toàn y tế.</span>
              </div>

              <!-- FORM ACTIONS -->
              <div class="form-actions-bar">
                <button
                  mat-stroked-button
                  type="button"
                  (click)="resetForm()"
                  [disabled]="isSaving"
                  class="btn-reset"
                >
                  <mat-icon>restart_alt</mat-icon>
                  <span>Khôi phục ban đầu</span>
                </button>

                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="isSaving || profileForm.invalid"
                  class="btn-submit"
                >
                  <mat-spinner *ngIf="isSaving" diameter="20" class="spinner-inline"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">save</mat-icon>
                  <span>{{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ' }}</span>
                </button>
              </div>
            </form>
          </mat-card>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-page-wrapper {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* HERO BANNER */
    .profile-hero-banner {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #0c4a6e 100%);
      border-radius: 20px;
      padding: 36px 36px;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%);
        pointer-events: none;
      }
    }

    .banner-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      position: relative;
      z-index: 1;
    }

    .banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-bottom: 12px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .banner-title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 0 0 8px;
      color: #ffffff;
    }

    .banner-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.88);
      max-width: 580px;
      margin: 0;
      line-height: 1.6;
    }

    .banner-stats {
      display: flex;
      gap: 16px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      min-width: 180px;
    }

    .stat-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.primary {
        background: #e0f2fe;
        mat-icon { color: #0284c7; }
      }

      &.success {
        background: #dcfce7;
        mat-icon { color: #16a34a; }
      }
    }

    .stat-meta {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .stat-value {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;

      &.success-text {
        color: #16a34a;
      }
    }

    /* TWO-COLUMN LAYOUT */
    .profile-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 28px;
      align-items: start;
    }

    /* LEFT SIDEBAR */
    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .identity-card {
      background: #ffffff !important;
      border-radius: 20px !important;
      padding: 32px 24px 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
      text-align: center;
    }

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin: 0 auto 16px;
    }

    .avatar-ring {
      padding: 5px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
      box-shadow: 0 8px 20px -4px rgba(2, 132, 199, 0.35);
    }

    .avatar-circle {
      width: 108px;
      height: 108px;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 800;
      color: #0284c7;
      border: 4px solid #ffffff;
    }

    .avatar-verified-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: #ffffff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);

      mat-icon {
        color: #0284c7;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .patient-name {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.02em;
    }

    .patient-email {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 14px;
      word-break: break-all;
    }

    .patient-role-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e0f2fe;
      color: #0369a1;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 20px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .card-divider {
      margin: 16px 0;
      border-color: #f1f5f9;
    }

    .sidebar-menu {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      color: #475569;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;

      mat-icon {
        color: #64748b;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .arrow {
        margin-left: auto;
        color: #cbd5e1;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: #f8fafc;
        color: #0284c7;
        mat-icon { color: #0284c7; }
        .arrow { color: #0284c7; }
      }

      &.active {
        background: #f0f9ff;
        color: #0284c7;
        mat-icon { color: #0284c7; }
        .arrow { color: #0284c7; }
      }
    }

    /* EMERGENCY SUPPORT CARD */
    .support-card {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #a7f3d0;
      border-radius: 18px;
      padding: 20px;
    }

    .support-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .support-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        color: #ffffff;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .support-title {
      font-size: 14px;
      font-weight: 700;
      color: #065f46;
      margin: 0;
    }

    .support-sub {
      font-size: 12px;
      color: #047857;
      margin: 2px 0 0;
    }

    .support-phone {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #ffffff;
      color: #059669;
      font-size: 16px;
      font-weight: 800;
      padding: 10px 16px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-1px);
      }
    }

    /* RIGHT CONTENT: FORM CARD */
    .form-container-card {
      background: #ffffff !important;
      border-radius: 20px !important;
      padding: 32px 36px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05) !important;
    }

    .form-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #e0f2fe;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        color: #0284c7;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
    }

    .header-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .header-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;

      mat-icon {
        color: #0284c7;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px 24px;
    }

    .full-span {
      grid-column: 1 / -1;
    }

    .field-icon {
      color: #94a3b8;
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .section-divider {
      margin: 28px 0;
      border-color: #f1f5f9;
    }

    /* PRIVACY NOTICE */
    .privacy-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      font-size: 13px;
      color: #64748b;
      margin-top: 24px;

      mat-icon {
        color: #0284c7;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    /* ACTION BUTTONS */
    .form-actions-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-reset {
      height: 46px;
      padding: 0 20px;
      border-radius: 12px;
      font-weight: 600;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-submit {
      height: 46px;
      padding: 0 28px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 6px;
    }

    /* RESPONSIVE */
    @media (max-width: 992px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      .banner-container {
        flex-direction: column;
        align-items: flex-start;
      }
      .banner-stats {
        width: 100%;
      }
      .stat-card {
        flex: 1;
      }
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .profile-hero-banner {
        padding: 24px 20px;
      }
      .banner-title {
        font-size: 22px;
      }
      .form-container-card {
        padding: 20px;
      }
      .form-actions-bar {
        flex-direction: column;
        button { width: 100%; }
      }
      .error-banner {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      color: #991b1b;
      margin-bottom: 24px;

      .err-icon { color: #ef4444; font-size: 24px; width: 24px; height: 24px; }
      .err-text { flex: 1; strong { font-size: 14px; } p { margin: 2px 0 0; font-size: 13px; color: #b91c1c; } }
      button {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 38px;
        mat-icon { font-size: 18px; width: 18px; height: 18px; }
      }
    }
  `],
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profile: PatientProfileResponse | null = null;
  isLoading = false;
  isSaving = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private profileService: PatientProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  get currentUser() { return this.authService.getCurrentUser(); }

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(4)]],
      email:       ['', [Validators.required, Validators.email]],
      phone:       [''],
      dateOfBirth: [''],
      gender:      [''],
      address:     [''],
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        if (this.profile) {
          this.patchFormValues();
        }
        this.isLoading = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải hồ sơ cá nhân.';
      },
    });
  }

  private patchFormValues(): void {
    if (!this.profile) return;
    this.profileForm.patchValue({
      fullName:    this.profile.fullName ?? '',
      email:       this.profile.email ?? '',
      phone:       this.profile.phone ?? '',
      dateOfBirth: this.profile.dateOfBirth ?? '',
      gender:      this.profile.gender ?? '',
      address:     this.profile.address ?? '',
    });
  }

  resetForm(): void {
    this.patchFormValues();
    this.snackBar.open('Đã khôi phục dữ liệu ban đầu', 'Đóng', { duration: 2000 });
  }

  onSubmit(): void {
    if (this.isSaving || this.isLoading || this.hasError) return;
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const values = this.profileForm.value;
    // Ô tùy chọn để trống phải gửi null để không bị kiểm tra như một giá trị đã nhập.
    const request: PatientProfileRequest = {
      ...values, fullName: values.fullName.trim(), email: values.email.trim(),
      dateOfBirth: values.dateOfBirth || null, gender: values.gender || null,
    };
    this.profileService.updateMyProfile(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Đã lưu thông tin hồ sơ y tế thành công!', 'Đóng', {
          duration: 3500,
          panelClass: 'success-snackbar',
        });
        this.loadProfile();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại, vui lòng thử lại', 'Đóng', {
          duration: 4000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }

  getInitials(): string {
    const name = this.profile?.fullName || this.currentUser?.fullName || this.currentUser?.username || 'BN';
    return name
      .trim()
      .split(/\s+/)
      .map((p: string) => p[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }
}
