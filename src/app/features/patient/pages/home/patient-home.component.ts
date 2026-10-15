import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { SpecialtyResponse } from '../../../../core/models/domain.model';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NgIf,
    NgFor,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="patient-home fade-in">
      <!-- COMPACT HERO BANNER -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <mat-icon>local_hospital</mat-icon>
            <span>Đặt lịch khám bệnh</span>
          </div>

          <h1 class="hero-title">
            Tìm bác sĩ và đặt lịch khám trực tuyến
          </h1>

          <p class="hero-subtitle">
            Chủ động chọn bác sĩ chuyên khoa và khung giờ khám bệnh phù hợp mà không cần chờ đợi xếp hàng.
          </p>

          <!-- Search Bar (Primary Action) -->
          <div class="hero-search-bar">
            <div class="search-input-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input
                type="text"
                [(ngModel)]="searchKeyword"
                (keyup.enter)="onSearch()"
                placeholder="Tìm theo tên bác sĩ hoặc chuyên khoa..."
                class="search-input"
              />
            </div>
            <button mat-flat-button color="primary" (click)="onSearch()" class="search-btn">
              <mat-icon>search</mat-icon>
              <span>Tìm bác sĩ</span>
            </button>
          </div>

          <!-- Quick Shortcuts -->
          <div class="hero-shortcuts">
            <span class="shortcut-label">Gợi ý nhanh:</span>
            <button class="shortcut-chip" (click)="quickFilter('tim mạch')">Tim mạch</button>
            <button class="shortcut-chip" (click)="quickFilter('nhi')">Nhi khoa</button>
            <button class="shortcut-chip" (click)="quickFilter('mắt')">Mắt</button>
            <button class="shortcut-chip" (click)="quickFilter('tai mũi họng')">Tai Mũi Họng</button>
          </div>
        </div>
      </section>

      <!-- PRIMARY NAVIGATION TILES -->
      <section class="nav-tiles-section">
        <div class="tile-grid">
          <a class="nav-tile" routerLink="/patient/doctors">
            <div class="tile-icon icon-blue"><mat-icon>person_search</mat-icon></div>
            <div class="tile-info">
              <h3>Danh sách Bác sĩ</h3>
              <p>Xem thông tin, chuyên môn và đặt lịch khám với bác sĩ</p>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a class="nav-tile" routerLink="/patient/appointments">
            <div class="tile-icon icon-teal"><mat-icon>calendar_today</mat-icon></div>
            <div class="tile-info">
              <h3>Lịch hẹn của tôi</h3>
              <p>Theo dõi trạng thái lịch khám đã đăng ký và quản lý ca hẹn</p>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>

          <a class="nav-tile" routerLink="/patient/profile">
            <div class="tile-icon icon-slate"><mat-icon>badge</mat-icon></div>
            <div class="tile-info">
              <h3>Hồ sơ cá nhân</h3>
              <p>Cập nhật số điện thoại liên lạc và thông tin tài khoản</p>
            </div>
            <mat-icon class="tile-arrow">arrow_forward</mat-icon>
          </a>
        </div>
      </section>

      <!-- SPECIALTIES SECTION -->
      <section class="specialties-section">
        <div class="section-header-row">
          <div>
            <h2 class="section-heading">Chuyên khoa khám bệnh</h2>
            <p class="section-subheading">Danh mục các chuyên khoa đang tiếp nhận đăng ký khám</p>
          </div>
          <a mat-stroked-button color="primary" routerLink="/patient/doctors">
            <span>Xem tất cả bác sĩ</span>
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <!-- Loading State -->
        <app-loading *ngIf="isLoadingSpecialties" message="Đang tải danh mục chuyên khoa..."></app-loading>

        <!-- Error State -->
        <div class="error-banner" *ngIf="hasSpecialtyError">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <div class="error-text">
            <strong>Không thể tải dữ liệu chuyên khoa</strong>
            <p>{{ errorMessage }}</p>
          </div>
          <button mat-stroked-button color="warn" (click)="loadSpecialties()">
            <mat-icon>refresh</mat-icon>
            Thử lại
          </button>
        </div>

        <!-- Empty State -->
        <app-empty-state
          *ngIf="!isLoadingSpecialties && !hasSpecialtyError && specialties.length === 0"
          icon="local_hospital"
          title="Chưa có chuyên khoa nào"
          message="Hệ thống đang cập nhật danh mục chuyên khoa."
        ></app-empty-state>

        <!-- Specialties Grid -->
        <div class="specialties-grid" *ngIf="!isLoadingSpecialties && !hasSpecialtyError && specialties.length > 0">
          <div
            *ngFor="let s of specialties"
            class="specialty-card"
            (click)="selectSpecialty(s)"
          >
            <div class="specialty-icon-box">
              <mat-icon>{{ getSpecialtyIcon(s.name) }}</mat-icon>
            </div>
            <h4 class="specialty-title">{{ s.name }}</h4>
            <p class="specialty-desc">{{ s.description || 'Khám và tư vấn chuyên sâu' }}</p>
            <span class="specialty-link">
              <span>Đặt khám</span>
              <mat-icon>chevron_right</mat-icon>
            </span>
          </div>
        </div>
      </section>

      <!-- 3-STEP WORKFLOW -->
      <section class="workflow-section">
        <h2 class="section-heading text-center">Quy trình đặt lịch khám</h2>
        <p class="section-subheading text-center">3 bước nhanh chóng để đăng ký ca khám bệnh</p>

        <div class="workflow-grid">
          <div class="workflow-step">
            <div class="step-num">01</div>
            <div class="step-icon"><mat-icon>person_search</mat-icon></div>
            <h4>Chọn Bác sĩ & Chuyên khoa</h4>
            <p>Tra cứu thông tin bác sĩ theo chuyên khoa bạn cần khám</p>
          </div>

          <div class="workflow-step">
            <div class="step-num">02</div>
            <div class="step-icon"><mat-icon>calendar_month</mat-icon></div>
            <h4>Chọn Khung giờ khám</h4>
            <p>Lựa chọn ca khám còn trống phù hợp với thời gian của bạn</p>
          </div>

          <div class="workflow-step">
            <div class="step-num">03</div>
            <div class="step-icon"><mat-icon>check_circle</mat-icon></div>
            <h4>Xác nhận và Đến khám</h4>
            <p>Theo dõi mã lịch hẹn và đến phòng khám đúng khung giờ đã chọn</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .patient-home {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* COMPACT HERO SECTION */
    .hero-section {
      background: linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #0ea5e9 100%);
      border-radius: 16px;
      padding: 36px 32px;
      color: #ffffff;
      box-shadow: 0 4px 16px -2px rgba(2, 132, 199, 0.25);
    }

    .hero-content {
      max-width: 720px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.18);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 14px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #bae6fd; }
    }

    .hero-title {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.3;
      margin: 0 0 10px;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font-size: 15px;
      line-height: 1.5;
      color: #e0f2fe;
      margin: 0 0 24px;
    }

    /* SEARCH BAR */
    .hero-search-bar {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 12px;
      padding: 6px 8px 6px 16px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      max-width: 620px;
      gap: 10px;
    }

    .search-input-wrap {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 10px;
    }

    .search-icon {
      color: #0284c7;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .search-input {
      border: none;
      outline: none;
      width: 100%;
      font-size: 14px;
      color: #0f172a;
      font-family: inherit;

      &::placeholder {
        color: #94a3b8;
      }
    }

    .search-btn {
      height: 42px;
      padding: 0 18px;
      border-radius: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .hero-shortcuts {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .shortcut-label {
      font-size: 12px;
      color: #bae6fd;
      font-weight: 500;
    }

    .shortcut-chip {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    }

    /* NAVIGATION TILES */
    .tile-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .nav-tile {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);

      &:hover {
        border-color: #0284c7;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(2, 132, 199, 0.1);

        .tile-arrow { color: #0284c7; transform: translateX(3px); }
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

    .icon-blue  { background: #e0f2fe; mat-icon { color: #0284c7; } }
    .icon-teal  { background: #ccfbf1; mat-icon { color: #0d9488; } }
    .icon-slate { background: #f1f5f9; mat-icon { color: #475569; } }

    .tile-info {
      flex: 1;

      h3 {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 4px;
      }

      p {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.4;
      }
    }

    .tile-arrow {
      color: #94a3b8;
      font-size: 20px;
      width: 20px;
      height: 20px;
      transition: all 0.2s;
    }

    /* SECTION HEADINGS */
    .section-heading {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0 0 4px;

      &.text-center { text-align: center; }
    }

    .section-subheading {
      font-size: 13px;
      color: #64748b;
      margin: 0;

      &.text-center { text-align: center; }
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    /* SPECIALTIES GRID */
    .specialties-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .specialty-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #0284c7;
        box-shadow: 0 6px 16px rgba(2, 132, 199, 0.08);
        transform: translateY(-2px);

        .specialty-icon-box {
          background: #0284c7;
          mat-icon { color: #ffffff; }
        }
      }
    }

    .specialty-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      mat-icon {
        color: #0284c7;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .specialty-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 0;
    }

    .specialty-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .specialty-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #0284c7;
      font-size: 12px;
      font-weight: 600;
      margin-top: auto;
      padding-top: 6px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* ERROR BANNER */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      color: #991b1b;

      .error-icon { color: #ef4444; font-size: 24px; width: 24px; height: 24px; }
      .error-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }

    /* WORKFLOW SECTION */
    .workflow-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 28px;
    }

    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 28px;
    }

    .workflow-step {
      text-align: center;
      padding: 12px;

      .step-num {
        font-size: 12px;
        font-weight: 800;
        color: #0284c7;
        background: #e0f2fe;
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        margin-bottom: 12px;
      }

      .step-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;

        mat-icon {
          color: #0284c7;
          font-size: 26px;
          width: 26px;
          height: 26px;
        }
      }

      h4 {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 6px;
      }

      p {
        font-size: 12px;
        color: #64748b;
        line-height: 1.5;
        margin: 0;
      }
    }

    @media (max-width: 992px) {
      .specialties-grid { grid-template-columns: repeat(2, 1fr); }
      .tile-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .hero-section { padding: 24px 20px; }
      .hero-title { font-size: 22px; }
      .hero-search-bar { flex-direction: column; padding: 10px; }
      .search-btn { width: 100%; }
      .specialties-grid { grid-template-columns: 1fr; }
      .workflow-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientHomeComponent implements OnInit {
  searchKeyword = '';
  specialties: SpecialtyResponse[] = [];
  isLoadingSpecialties = false;
  hasSpecialtyError = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private specialtyService: SpecialtyService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.isLoadingSpecialties = true;
    this.hasSpecialtyError = false;
    this.errorMessage = '';

    this.specialtyService.getAll().subscribe({
      next: (res) => {
        this.specialties = res.data ?? [];
        this.isLoadingSpecialties = false;
      },
      error: (err) => {
        this.isLoadingSpecialties = false;
        this.hasSpecialtyError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải danh mục chuyên khoa.';
      },
    });
  }

  onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/patient/doctors'], {
        queryParams: { keyword: this.searchKeyword.trim() },
      });
    } else {
      this.router.navigate(['/patient/doctors']);
    }
  }

  quickFilter(term: string): void {
    this.router.navigate(['/patient/doctors'], {
      queryParams: { keyword: term },
    });
  }

  selectSpecialty(specialty: SpecialtyResponse): void {
    this.router.navigate(['/patient/doctors'], {
      queryParams: { specialtyId: specialty.id },
    });
  }

  getSpecialtyIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('tim') || n.includes('cardio')) return 'favorite';
    if (n.includes('nhi') || n.includes('pediat')) return 'child_care';
    if (n.includes('mắt') || n.includes('ophtha')) return 'visibility';
    if (n.includes('răng') || n.includes('nha') || n.includes('dental')) return 'sentiment_very_satisfied';
    if (n.includes('da') || n.includes('derma')) return 'spa';
    if (n.includes('thần kinh') || n.includes('neuro')) return 'psychology';
    if (n.includes('tai') || n.includes('mũi') || n.includes('họng') || n.includes('ent')) return 'hearing';
    return 'healing';
  }
}
