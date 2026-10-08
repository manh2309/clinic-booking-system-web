import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatChipsModule, MatPaginatorModule,
    NgIf, NgFor,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
  ],
  template: `
    <div>
      <app-page-header title="Tìm bác sĩ" subtitle="Tìm và đặt lịch khám với bác sĩ phù hợp"></app-page-header>

      <!-- Search Bar -->
      <mat-card class="search-card">
        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="search-input">
              <mat-label>Tìm kiếm bác sĩ</mat-label>
              <input matInput formControlName="keyword" placeholder="Nhập tên bác sĩ..." />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="specialty-select">
              <mat-label>Chuyên khoa</mat-label>
              <mat-select formControlName="specialtyId">
                <mat-option [value]="null">Tất cả chuyên khoa</mat-option>
                <mat-option *ngFor="let s of specialties" [value]="s.id">{{ s.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <app-loading *ngIf="isLoading" message="Đang tải danh sách bác sĩ..."></app-loading>

      <!-- Doctors Grid -->
      <div class="doctors-grid" *ngIf="!isLoading">
        <!-- Empty state -->
        <app-empty-state
          *ngIf="doctors.length === 0"
          icon="person_search"
          title="Không tìm thấy bác sĩ"
          message="Thử tìm kiếm với từ khóa khác hoặc chọn chuyên khoa khác"
        ></app-empty-state>

        <!-- Doctor cards -->
        <mat-card class="doctor-card" *ngFor="let doctor of doctors">
          <mat-card-content>
            <div class="doctor-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <div class="doctor-info">
              <h3 class="doctor-name">{{ doctor.fullName }}</h3>
              <div class="doctor-specialty" *ngIf="doctor.specialtyName">
                <mat-icon>local_hospital</mat-icon>
                {{ doctor.specialtyName }}
              </div>
              <div class="doctor-qualification" *ngIf="doctor.qualification">
                <mat-icon>school</mat-icon>
                {{ doctor.qualification }}
              </div>
              <p class="doctor-desc" *ngIf="doctor.description">{{ doctor.description }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="bookDoctor(doctor)">
              <mat-icon>calendar_month</mat-icon>
              Đặt lịch khám
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="totalElements > 0"
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="currentPage"
        [pageSizeOptions]="[10, 20, 50]"
        (page)="onPageChange($event)"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .search-card {
      margin-bottom: 20px;
      border-radius: 12px;
    }
    .search-form {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-input  { flex: 1; min-width: 220px; }
    .specialty-select { width: 220px; }

    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .doctor-card {
      border-radius: 12px;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; }
    }

    .doctor-avatar {
      width: 64px;
      height: 64px;
      background: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: #1565c0; }
    }

    .doctor-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 8px;
    }

    .doctor-specialty, .doctor-qualification {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .doctor-desc {
      font-size: 13px;
      color: #9ca3af;
      margin: 8px 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class PatientDoctorsComponent implements OnInit, OnDestroy {
  searchForm!: FormGroup;
  doctors: DoctorResponse[] = [];
  specialties: SpecialtyResponse[] = [];
  isLoading = false;
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private specialtyService: SpecialtyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      specialtyId: [null],
    });

    this.loadSpecialties();
    this.loadDoctors();

    // Auto search khi thay đổi form
    this.searchForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadDoctors();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSpecialties(): void {
    this.specialtyService.getAll().subscribe({
      next: (res) => { this.specialties = res.data ?? []; },
      error: () => {},
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    const { keyword, specialtyId } = this.searchForm.value as { keyword: string; specialtyId: number | null };
    this.doctorService.search({
      keyword: keyword || undefined,
      specialtyId: specialtyId || undefined,
      page: this.currentPage,
      size: this.pageSize,
    }).subscribe({
      next: (res) => {
        this.doctors = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
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
}
