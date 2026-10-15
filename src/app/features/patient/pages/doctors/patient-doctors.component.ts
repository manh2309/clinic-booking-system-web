import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgIf, NgFor } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { DoctorResponse, SpecialtyResponse } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-patient-doctors',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule,
    NgIf,
    NgFor,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="patient-doctors-page fade-in">
      <app-page-header
        title="Đội ngũ Bác sĩ Chuyên khoa"
        subtitle="Tìm kiếm chuyên gia y tế giàu kinh nghiệm và đặt lịch khám nhanh chóng"
      ></app-page-header>

      <!-- FILTER & SEARCH CARD -->
      <mat-card class="search-filter-card">
        <mat-card-content>
          <form [formGroup]="searchForm" class="filter-form">
            <div class="filter-input-wrap">
              <mat-form-field appearance="outline" class="keyword-field">
                <mat-label>Tìm theo tên bác sĩ hoặc học vị</mat-label>
                <input matInput formControlName="keyword" placeholder="Nhập tên bác sĩ cần tìm..." />
                <mat-icon matPrefix class="field-icon">search</mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  *ngIf="searchForm.get('keyword')?.value"
                  (click)="searchForm.get('keyword')?.setValue('')"
                  type="button"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </mat-form-field>

              <mat-form-field appearance="outline" class="specialty-field">
                <mat-label>Lọc theo chuyên khoa</mat-label>
                <mat-select formControlName="specialtyId">
                  <mat-option [value]="null">Tất cả chuyên khoa</mat-option>
                  <mat-option *ngFor="let s of specialties" [value]="s.id">{{ s.name }}</mat-option>
                </mat-select>
                <mat-icon matPrefix class="field-icon">local_hospital</mat-icon>
              </mat-form-field>
            </div>

            <!-- Quick Specialty Chips -->
            <div class="quick-chips" *ngIf="specialties.length > 0">
              <span class="chips-label">Chuyên khoa gợi ý:</span>
              <button
                type="button"
                class="chip-btn"
                [class.active]="searchForm.get('specialtyId')?.value === null"
                (click)="searchForm.get('specialtyId')?.setValue(null)"
              >
                Tất cả
              </button>
              <button
                type="button"
                *ngFor="let s of specialties.slice(0, 5)"
                class="chip-btn"
                [class.active]="searchForm.get('specialtyId')?.value === s.id"
                (click)="searchForm.get('specialtyId')?.setValue(s.id)"
              >
                {{ s.name }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- LOADING STATE -->
      <app-loading *ngIf="isLoading" message="Đang tìm kiếm bác sĩ..."></app-loading>

      <!-- ERROR STATE -->
      <div class="error-banner" *ngIf="!isLoading && hasError">
        <mat-icon class="err-icon">error_outline</mat-icon>
        <div class="err-text">
          <strong>Không thể tải danh sách bác sĩ</strong>
          <p>{{ errorMessage }}</p>
        </div>
        <button mat-stroked-button color="warn" (click)="loadDoctors()">
          <mat-icon>refresh</mat-icon>
          Thử lại
        </button>
      </div>

      <!-- RESULTS SECTION -->
      <div class="results-container" *ngIf="!isLoading && !hasError">
        <!-- Results count header -->
        <div class="results-meta-row" *ngIf="doctors.length > 0">
          <span class="results-count">
            Tìm thấy <strong>{{ totalElements }}</strong> bác sĩ phù hợp
          </span>
        </div>

        <!-- Empty State -->
        <app-empty-state
          *ngIf="doctors.length === 0"
          icon="person_search"
          title="Không tìm thấy bác sĩ phù hợp"
          message="Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn lại chuyên khoa."
        ></app-empty-state>

        <!-- DOCTORS GRID -->
        <div class="doctors-grid" *ngIf="doctors.length > 0">
          <div class="doctor-card" *ngFor="let doctor of doctors">
            <!-- Top Card Header -->
            <div class="card-top">
              <div class="doctor-avatar-wrap">
                <div class="avatar-ring">
                  <div class="avatar-circle">
                    <span>{{ getInitials(doctor.fullName) }}</span>
                  </div>
                </div>
              </div>

              <div class="doctor-primary-meta">
                <div class="specialty-pill" *ngIf="doctor.specialtyName">
                  <mat-icon>medical_services</mat-icon>
                  <span>{{ doctor.specialtyName }}</span>
                </div>
                <h3 class="doctor-title">{{ doctor.fullName }}</h3>
                <p class="doctor-qual" *ngIf="doctor.qualification">
                  <mat-icon>school</mat-icon>
                  <span>{{ doctor.qualification }}</span>
                </p>
              </div>
            </div>

            <!-- Body Description -->
            <div class="card-body">
              <p class="doctor-bio">
                {{ doctor.description || 'Bác sĩ chuyên khoa tại hệ thống ClinicCare tiếp nhận khám và tư vấn theo lịch hẹn.' }}
              </p>
            </div>

            <!-- Footer Action -->
            <div class="card-footer">
              <button mat-flat-button color="primary" class="btn-book" (click)="bookDoctor(doctor)">
                <mat-icon>calendar_month</mat-icon>
                <span>Đặt lịch khám ngay</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="paginator-wrap" *ngIf="totalElements > pageSize">
          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            [pageSizeOptions]="[12, 24, 48]"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-doctors-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* FILTER CARD */
    .search-filter-card {
      border-radius: 20px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05) !important;
      background: #ffffff !important;
    }

    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }

    .filter-input-wrap {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 20px;
    }

    .field-icon {
      color: #94a3b8;
      margin-right: 8px;
    }

    /* QUICK CHIPS */
    .quick-chips {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 4px;
    }

    .chips-label {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
    }

    .chip-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }

      &.active {
        background: #e0f2fe;
        color: #0284c7;
        border-color: #38bdf8;
      }
    }

    /* RESULTS META */
    .results-meta-row {
      margin-bottom: 16px;
      font-size: 14px;
      color: #64748b;
    }

    /* DOCTORS GRID */
    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .doctor-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.04);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 28px -4px rgba(2, 132, 199, 0.14);
        border-color: #7dd3fc;
      }
    }

    .card-top {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .avatar-ring {
      padding: 3px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
    }

    .avatar-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      border: 2px solid #ffffff;
    }

    .doctor-primary-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .specialty-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #e0f2fe;
      color: #0284c7;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      width: fit-content;

      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .doctor-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 2px 0 0;
      letter-spacing: -0.02em;
    }

    .doctor-qual {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #64748b;
      margin: 0;

      mat-icon { font-size: 15px; width: 15px; height: 15px; color: #0d9488; }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .doctor-bio {
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
      margin-bottom: 16px;

      .err-icon { color: #ef4444; font-size: 22px; width: 22px; height: 22px; }
      .err-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }

    .card-footer {
      margin-top: auto;
      padding-top: 8px;
    }

    .btn-book {
      width: 100%;
      height: 44px;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .paginator-wrap {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .filter-input-wrap { grid-template-columns: 1fr; }
      .doctors-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientDoctorsComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  doctors: DoctorResponse[] = [];
  specialties: SpecialtyResponse[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private specialtyService: SpecialtyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      specialtyId: [null],
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['keyword']) {
        this.searchForm.patchValue({ keyword: params['keyword'] }, { emitEvent: false });
      }
      if (params['specialtyId']) {
        this.searchForm.patchValue({ specialtyId: +params['specialtyId'] }, { emitEvent: false });
      }
    });

    this.loadSpecialties();
    this.loadDoctors();

    // Auto search khi gõ
    this.searchForm.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadDoctors();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  specialtiesError = false;

  loadSpecialties(): void {
    this.specialtiesError = false;
    this.specialtyService.getAll().subscribe({
      next: (res) => {
        this.specialties = res.data ?? [];
      },
      error: () => {
        this.specialtiesError = true;
      },
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const { keyword, specialtyId } = this.searchForm.value as {
      keyword: string;
      specialtyId: number | null;
    };
    this.doctorService
      .search({
        keyword: keyword?.trim() || undefined,
        specialtyId: specialtyId || undefined,
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.doctors = res.data?.content ?? [];
          this.totalElements = res.data?.totalElements ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải danh sách bác sĩ.';
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDoctors();
  }

  bookDoctor(doctor: DoctorResponse): void {
    this.router.navigate(['/patient/booking', doctor.id]);
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
