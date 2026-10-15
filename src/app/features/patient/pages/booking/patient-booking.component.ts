import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorResponse, SlotResponse } from '../../../../core/models/domain.model';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-patient-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    NgIf, NgFor, DatePipe,
    PageHeaderComponent, LoadingComponent,
  ],
  template: `
    <div>
      <app-page-header
        title="Đặt lịch khám"
        [breadcrumbs]="breadcrumbs"
      ></app-page-header>

      <app-loading *ngIf="isLoadingDoctor" message="Đang tải thông tin bác sĩ..."></app-loading>

      <!-- Doctor Error State -->
      <div class="error-banner" *ngIf="!isLoadingDoctor && hasDoctorError">
        <mat-icon class="err-icon">error_outline</mat-icon>
        <div class="err-text">
          <strong>Không thể tải thông tin bác sĩ</strong>
          <p>{{ doctorErrorMessage }}</p>
        </div>
        <button mat-stroked-button color="primary" routerLink="/patient/doctors">
          <mat-icon>arrow_back</mat-icon>
          Danh sách bác sĩ
        </button>
      </div>

      <div class="booking-layout" *ngIf="!isLoadingDoctor && !hasDoctorError && doctor">
        <!-- Doctor Info Card -->
        <mat-card class="doctor-info-card">
          <mat-card-content>
            <div class="doctor-header">
              <div class="doctor-avatar-lg">
                <mat-icon>person</mat-icon>
              </div>
              <div>
                <h2 class="doctor-name">{{ doctor.fullName }}</h2>
                <p class="doctor-specialty" *ngIf="doctor.specialtyName">
                  <mat-icon>local_hospital</mat-icon>
                  {{ doctor.specialtyName }}
                </p>
                <p class="doctor-qual" *ngIf="doctor.qualification">
                  <mat-icon>school</mat-icon>
                  {{ doctor.qualification }}
                </p>
              </div>
            </div>
            <p class="doctor-desc" *ngIf="doctor.description">{{ doctor.description }}</p>
          </mat-card-content>
        </mat-card>

        <!-- Slot Selection -->
        <mat-card class="slot-card">
          <mat-card-header>
            <mat-card-title>Chọn ngày và giờ khám</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <!-- Date picker -->
            <mat-form-field appearance="outline" class="date-picker">
              <mat-label>Chọn ngày</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                [min]="minDate"
                [(ngModel)]="selectedDate"
                (dateChange)="onDateChange()"
                placeholder="Chọn ngày khám"
              />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <!-- Loading slots -->
            <app-loading *ngIf="isLoadingSlots" [diameter]="32" message="Đang tải khung giờ..."></app-loading>

            <!-- Slots grid -->
            <div class="slots-section" *ngIf="!isLoadingSlots && selectedDate">
              <p class="slots-title" *ngIf="slots.length === 0">Không có khung giờ trống trong ngày này</p>
              <div class="slots-grid" *ngIf="slots.length > 0">
                <button
                  *ngFor="let slot of slots"
                  class="slot-btn"
                  [class.slot-btn--selected]="selectedSlot?.id === slot.id"
                  (click)="selectSlot(slot)"
                  mat-stroked-button
                >
                  <mat-icon>schedule</mat-icon>
                  {{ slot.startAt | date:'HH:mm' }} – {{ slot.endAt | date:'HH:mm' }}
                </button>
              </div>
            </div>

            <!-- Confirm button -->
            <div class="confirm-section" *ngIf="selectedSlot">
              <div class="selected-info">
                <mat-icon>check_circle</mat-icon>
                <span>
                  Đã chọn: {{ selectedDate | date:'dd/MM/yyyy' }} lúc
                  {{ selectedSlot.startAt | date:'HH:mm' }}
                </span>
              </div>
              <button
                mat-flat-button
                color="primary"
                class="confirm-btn"
                (click)="confirmBooking()"
                [disabled]="isBooking"
              >
                <mat-spinner *ngIf="isBooking" diameter="18"></mat-spinner>
                <span *ngIf="!isBooking">
                  <mat-icon>calendar_today</mat-icon>
                  Xác nhận đặt lịch
                </span>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .booking-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
      align-items: start;
    }

    .doctor-info-card, .slot-card {
      border-radius: 20px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
    }

    .doctor-header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .doctor-avatar-lg {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #ffffff; }
    }

    .doctor-name { font-size: 19px; font-weight: 800; margin: 0 0 6px; color: #0f172a; letter-spacing: -0.02em; }

    .doctor-specialty, .doctor-qual {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #64748b; margin: 0 0 4px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #0284c7; }
    }

    .doctor-desc { font-size: 13px; color: #475569; line-height: 1.6; }

    .date-picker { width: 100%; margin-bottom: 20px; }

    .slots-title { color: #64748b; font-size: 14px; font-weight: 500; }

    .slots-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }

    .slot-btn {
      border-radius: 12px !important;
      font-size: 13px;
      padding: 0 16px;
      height: 44px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #cbd5e1 !important;
      font-weight: 600;
      color: #334155;
      transition: all 0.2s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #64748b; }

      &:hover {
        border-color: #0284c7 !important;
        background: #f0f9ff;
        color: #0284c7;
      }

      &.slot-btn--selected {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
        color: #fff !important;
        border-color: #0284c7 !important;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.28);
        mat-icon { color: #fff; }
      }
    }

    .confirm-section {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .selected-info {
      display: flex; align-items: center; gap: 8px;
      color: #15803d; font-size: 14px; font-weight: 700;
      background: #f0fdf4;
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid #bbf7d0;
      mat-icon { color: #16a34a; }
    }

    .confirm-btn {
      align-self: flex-start;
      height: 46px;
      padding: 0 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 24px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 14px;
      color: #991b1b;
      margin-bottom: 24px;

      .err-icon { color: #ef4444; font-size: 24px; width: 24px; height: 24px; }
      .err-text { flex: 1; strong { display: block; margin-bottom: 2px; } p { margin: 0; font-size: 13px; color: #b91c1c; } }
    }

    @media (max-width: 768px) {
      .booking-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientBookingComponent implements OnInit {
  doctor: DoctorResponse | null = null;
  slots: SlotResponse[] = [];
  selectedSlot: SlotResponse | null = null;
  selectedDate: Date | null = null;
  minDate = new Date();
  isLoadingDoctor = false;
  hasDoctorError = false;
  doctorErrorMessage = '';
  isLoadingSlots = false;
  isBooking = false;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Bác sĩ', route: '/patient/doctors' },
    { label: 'Đặt lịch khám' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadDoctor(id);
    } else {
      this.hasDoctorError = true;
      this.doctorErrorMessage = 'Mã bác sĩ không hợp lệ.';
    }
  }

  loadDoctor(id: number): void {
    this.isLoadingDoctor = true;
    this.hasDoctorError = false;
    this.doctorErrorMessage = '';

    this.doctorService.getById(id).subscribe({
      next: (res) => {
        this.doctor = res.data;
        this.isLoadingDoctor = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoadingDoctor = false;
        this.hasDoctorError = true;
        this.doctorErrorMessage = err?.error?.message ?? 'Không tìm thấy thông tin bác sĩ hoặc bác sĩ không tồn tại.';
      },
    });
  }

  onDateChange(): void {
    if (!this.selectedDate || !this.doctor) return;
    this.selectedSlot = null;
    this.isLoadingSlots = true;
    const dateStr = this.formatDate(this.selectedDate);
    this.doctorService.getAvailableSlots(this.doctor.id, dateStr).subscribe({
      next: (res) => {
        this.slots = res.data ?? [];
        this.isLoadingSlots = false;
      },
      error: (err: { error?: { message?: string } }) => {
        this.isLoadingSlots = false;
        this.slots = [];
        this.snackBar.open(err?.error?.message ?? 'Không thể tải danh sách khung giờ.', 'Đóng', { duration: 4000 });
      },
    });
  }

  selectSlot(slot: SlotResponse): void {
    this.selectedSlot = slot;
  }

  confirmBooking(): void {
    if (!this.selectedSlot) return;
    this.isBooking = true;
    this.appointmentService.book({ slotId: this.selectedSlot.id }).subscribe({
      next: () => {
        this.isBooking = false;
        this.snackBar.open('Đặt lịch khám thành công!', 'Đóng', {
          duration: 3500,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/patient/appointments']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isBooking = false;
        const msg = err?.error?.message ?? 'Đặt lịch thất bại. Khung giờ này có thể vừa bị người khác đặt, vui lòng chọn khung giờ khác.';
        this.snackBar.open(
          msg,
          'Đóng',
          { duration: 5000, panelClass: 'error-snackbar' }
        );
        // Cập nhật lại danh sách slot để xóa bỏ slot đã bị chiếm
        this.onDateChange();
      },
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
