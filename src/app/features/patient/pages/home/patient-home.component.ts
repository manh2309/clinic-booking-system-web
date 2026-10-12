import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { SpecialtyResponse } from '../../../../core/models/domain.model';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    NgFor,
  ],
  template: `
    <div class="patient-home fade-in">
      <!-- HERO BANNER -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-pill">
            <mat-icon>health_and_safety</mat-icon>
            <span>Nền tảng đặt lịch khám bệnh thông minh 4.0</span>
          </div>

          <h1 class="hero-title">
            Chăm sóc sức khỏe toàn diện<br />
            <span class="gradient-text">cho bạn và cả gia đình</span>
          </h1>

          <p class="hero-subtitle">
            Kết nối ngay với các bác sĩ chuyên khoa hàng đầu. Đặt lịch khám nhanh chóng, không phải chờ đợi xếp hàng.
          </p>

          <!-- Search Bar -->
          <div class="hero-search-bar">
            <div class="search-input-wrap">
              <mat-icon class="search-icon">search</mat-icon>
              <input
                type="text"
                [(ngModel)]="searchKeyword"
                (keyup.enter)="onSearch()"
                placeholder="Tìm bác sĩ theo tên, chuyên môn hoặc học vị..."
                class="search-input"
              />
            </div>
            <button mat-flat-button color="primary" (click)="onSearch()" class="search-btn">
              <mat-icon>travel_explore</mat-icon>
              <span>Tìm bác sĩ</span>
            </button>
          </div>

          <!-- Quick badges -->
          <div class="hero-badges">
            <span class="badge-item"><mat-icon>verified</mat-icon> 100% Bác sĩ uy tín</span>
            <span class="badge-item"><mat-icon>alarm_on</mat-icon> Đặt lịch 24/7</span>
            <span class="badge-item"><mat-icon>shield</mat-icon> Bảo mật hồ sơ</span>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card">
            <div class="visual-badge">
              <mat-icon>favorite</mat-icon>
              <span>Tận tâm chăm sóc</span>
            </div>
            <div class="visual-icon-circle">
              <mat-icon>medical_services</mat-icon>
            </div>
            <div class="visual-stat">
              <span class="stat-number">20+</span>
              <span class="stat-text">Chuyên khoa & Bác sĩ</span>
            </div>
            <div class="visual-rating">
              <mat-icon class="star">star</mat-icon>
              <mat-icon class="star">star</mat-icon>
              <mat-icon class="star">star</mat-icon>
              <mat-icon class="star">star</mat-icon>
              <mat-icon class="star">star</mat-icon>
              <span class="rating-text">4.9/5 hài lòng</span>
            </div>
          </div>
        </div>
      </section>

      <!-- QUICK ACTION TILES -->
      <section class="quick-actions-section">
        <h2 class="section-heading">Tiện ích sức khỏe dành cho bạn</h2>
        <div class="action-grid">
          <div class="action-card primary" routerLink="/patient/doctors">
            <div class="card-icon"><mat-icon>person_search</mat-icon></div>
            <div class="card-info">
              <h3>Tìm kiếm Bác sĩ</h3>
              <p>Xem danh sách bác sĩ chuyên khoa và đặt lịch khám phù hợp</p>
            </div>
            <mat-icon class="card-arrow">arrow_forward</mat-icon>
          </div>

          <div class="action-card accent" routerLink="/patient/appointments">
            <div class="card-icon"><mat-icon>event_available</mat-icon></div>
            <div class="card-info">
              <h3>Lịch hẹn của tôi</h3>
              <p>Theo dõi trạng thái lịch khám đã đặt, hủy hoặc đổi lịch dễ dàng</p>
            </div>
            <mat-icon class="card-arrow">arrow_forward</mat-icon>
          </div>

          <div class="action-card indigo" routerLink="/patient/medical-records">
            <div class="card-icon"><mat-icon>clinical_notes</mat-icon></div>
            <div class="card-info">
              <h3>Hồ sơ bệnh án</h3>
              <p>Tra cứu kết quả khám bệnh và đơn thuốc điện tử an toàn</p>
            </div>
            <mat-icon class="card-arrow">arrow_forward</mat-icon>
          </div>

          <div class="action-card emerald" routerLink="/patient/profile">
            <div class="card-icon"><mat-icon>badge</mat-icon></div>
            <div class="card-info">
              <h3>Hồ sơ cá nhân</h3>
              <p>Cập nhật thông tin định danh và số điện thoại liên lạc</p>
            </div>
            <mat-icon class="card-arrow">arrow_forward</mat-icon>
          </div>
        </div>
      </section>

      <!-- SPECIALTIES SECTION -->
      <section class="specialties-section">
        <div class="section-header-row">
          <div>
            <h2 class="section-heading">Chuyên khoa khám bệnh</h2>
            <p class="section-subheading">Đầy đủ các chuyên khoa mũi nhọn phục vụ nhu cầu khám chữa bệnh</p>
          </div>
          <button mat-stroked-button color="primary" routerLink="/patient/doctors">
            <span>Xem tất cả bác sĩ</span>
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div class="specialties-grid">
          <div
            *ngFor="let s of specialties"
            class="specialty-card"
            (click)="selectSpecialty(s)"
          >
            <div class="specialty-icon-box">
              <mat-icon>{{ getSpecialtyIcon(s.name) }}</mat-icon>
            </div>
            <h4 class="specialty-title">{{ s.name }}</h4>
            <p class="specialty-desc">{{ s.description || 'Khám và điều trị chuyên sâu' }}</p>
            <span class="specialty-link">
              <span>Đặt khám ngay</span>
              <mat-icon>chevron_right</mat-icon>
            </span>
          </div>
        </div>
      </section>

      <!-- 4-STEP BOOKING WORKFLOW -->
      <section class="workflow-section">
        <h2 class="section-heading text-center">Quy trình đặt lịch 4 bước đơn giản</h2>
        <p class="section-subheading text-center">Tiết kiệm thời gian, trải nghiệm y tế số hiện đại</p>

        <div class="workflow-grid">
          <div class="workflow-step">
            <div class="step-num">01</div>
            <div class="step-icon"><mat-icon>person_search</mat-icon></div>
            <h4>Chọn Bác sĩ & Chuyên khoa</h4>
            <p>Tra cứu thông tin bác sĩ giàu kinh nghiệm theo chuyên khoa mong muốn</p>
          </div>

          <div class="workflow-step">
            <div class="step-num">02</div>
            <div class="step-icon"><mat-icon>calendar_month</mat-icon></div>
            <h4>Chọn Ngày & Giờ khám</h4>
            <p>Lựa chọn khung giờ khám bệnh còn trống phù hợp với thời gian của bạn</p>
          </div>

          <div class="workflow-step">
            <div class="step-num">03</div>
            <div class="step-icon"><mat-icon>mark_email_read</mat-icon></div>
            <h4>Xác nhận lịch hẹn</h4>
            <p>Hệ thống tự động xác nhận và thông báo chi tiết qua tài khoản & tin nhắn</p>
          </div>

          <div class="workflow-step">
            <div class="step-num">04</div>
            <div class="step-icon"><mat-icon>medical_services</mat-icon></div>
            <h4>Đến khám trực tiếp</h4>
            <p>Đến phòng khám theo giờ hẹn, vào khám ngay không cần xếp hàng lấy số</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .patient-home {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    /* HERO SECTION */
    .hero-section {
      background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%);
      border-radius: 24px;
      padding: 56px 48px;
      color: #ffffff;
      display: grid;
      grid-template-columns: 1.4fr 0.8fr;
      gap: 40px;
      align-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 36px -10px rgba(2, 132, 199, 0.4);
    }

    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;

      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #7dd3fc; }
    }

    .hero-title {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: -0.03em;
      margin: 0 0 16px;
      color: #ffffff;

      .gradient-text {
        background: linear-gradient(90deg, #38bdf8 0%, #a7f3d0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .hero-subtitle {
      font-size: 16px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.88);
      margin: 0 0 32px;
      max-width: 560px;
    }

    /* SEARCH BAR */
    .hero-search-bar {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 16px;
      padding: 6px 8px 6px 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
      max-width: 620px;
      gap: 12px;
    }

    .search-input-wrap {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 10px;
    }

    .search-icon {
      color: #0284c7;
      font-size: 24px;
      width: 24px;
      height: 24px;
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
      height: 44px;
      padding: 0 20px;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hero-badges {
      display: flex;
      gap: 20px;
      margin-top: 24px;
    }

    .badge-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;

      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #38bdf8; }
    }

    /* VISUAL CARD */
    .hero-visual {
      display: flex;
      justify-content: center;
    }

    .visual-card {
      background: rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 24px;
      padding: 32px 28px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      width: 280px;
    }

    .visual-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #059669;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;

      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .visual-icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

      mat-icon {
        color: #0284c7;
        font-size: 44px;
        width: 44px;
        height: 44px;
      }
    }

    .stat-number {
      display: block;
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
    }

    .stat-text {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    .visual-rating {
      display: flex;
      align-items: center;
      gap: 2px;
      background: rgba(0, 0, 0, 0.18);
      padding: 6px 12px;
      border-radius: 9999px;

      .star {
        color: #facc15;
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .rating-text {
        font-size: 11px;
        color: #ffffff;
        font-weight: 600;
        margin-left: 4px;
      }
    }

    /* SECTION HEADINGS */
    .section-heading {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 6px;

      &.text-center { text-align: center; }
    }

    .section-subheading {
      font-size: 14px;
      color: #64748b;
      margin: 0;

      &.text-center { text-align: center; }
    }

    /* QUICK ACTION GRID */
    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-top: 20px;
    }

    .action-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      cursor: pointer;
      position: relative;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.04);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px -4px rgba(2, 132, 199, 0.15);
        border-color: #38bdf8;

        .card-arrow {
          transform: translateX(4px);
          color: #0284c7;
        }
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon { font-size: 26px; width: 26px; height: 26px; }
      }

      &.primary .card-icon { background: #e0f2fe; mat-icon { color: #0284c7; } }
      &.accent  .card-icon { background: #ccfbf1; mat-icon { color: #0d9488; } }
      &.indigo  .card-icon { background: #ede9fe; mat-icon { color: #6366f1; } }
      &.emerald .card-icon { background: #dcfce7; mat-icon { color: #10b981; } }

      .card-info {
        h3 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
        }
        p {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }
      }

      .card-arrow {
        color: #cbd5e1;
        margin-top: auto;
        transition: all 0.2s;
      }
    }

    /* SPECIALTIES SECTION */
    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .specialties-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .specialty-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);

      &:hover {
        transform: translateY(-3px);
        border-color: #0284c7;
        box-shadow: 0 10px 20px -3px rgba(2, 132, 199, 0.12);

        .specialty-icon-box {
          background: #0284c7;
          mat-icon { color: #ffffff; }
        }
      }
    }

    .specialty-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #f0f9ff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      mat-icon {
        color: #0284c7;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .specialty-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 0;
    }

    .specialty-desc {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
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
      font-size: 13px;
      font-weight: 600;
      margin-top: auto;
      padding-top: 8px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* WORKFLOW SECTION */
    .workflow-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      padding: 48px 36px;
    }

    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 36px;
    }

    .workflow-step {
      text-align: center;
      position: relative;
      padding: 16px;

      .step-num {
        font-size: 13px;
        font-weight: 800;
        color: #0284c7;
        background: #e0f2fe;
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        margin-bottom: 14px;
      }

      .step-icon {
        width: 60px;
        height: 60px;
        border-radius: 18px;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;

        mat-icon {
          color: #0284c7;
          font-size: 30px;
          width: 30px;
          height: 30px;
        }
      }

      h4 {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px;
      }

      p {
        font-size: 13px;
        color: #64748b;
        line-height: 1.5;
        margin: 0;
      }
    }

    @media (max-width: 1024px) {
      .hero-section {
        grid-template-columns: 1fr;
        padding: 40px 28px;
      }
      .hero-visual { display: none; }
      .action-grid { grid-template-columns: 1fr 1fr; }
      .specialties-grid { grid-template-columns: 1fr 1fr; }
      .workflow-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .hero-title { font-size: 26px; }
      .hero-search-bar { flex-direction: column; padding: 12px; }
      .search-btn { width: 100%; }
      .action-grid { grid-template-columns: 1fr; }
      .specialties-grid { grid-template-columns: 1fr; }
      .workflow-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientHomeComponent implements OnInit {
  searchKeyword = '';
  specialties: SpecialtyResponse[] = [];

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
    this.specialtyService.getAll().subscribe({
      next: (res) => {
        this.specialties = res.data ?? [];
      },
      error: () => {},
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
