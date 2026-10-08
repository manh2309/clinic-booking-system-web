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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

      <div class="booking-layout" *ngIf="!isLoadingDoctor && doctor">
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
      grid-template-columns: 340px 1fr;
      gap: 20px;
      align-items: start;
    }

    .doctor-info-card, .slot-card { border-radius: 12px; }

    .doctor-header {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .doctor-avatar-lg {
      width: 80px;
      height: 80px;
      background: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 44px; width: 44px; height: 44px; color: #1565c0; }
    }

    .doctor-name { font-size: 18px; font-weight: 700; margin: 0 0 6px; color: #1a1a2e; }

    .doctor-specialty, .doctor-qual {
      display: flex; align-items: center; gap: 5px;
      font-size: 13px; color: #6b7280; margin: 0 0 4px;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }

    .doctor-desc { font-size: 14px; color: #6b7280; line-height: 1.6; }

    .date-picker { width: 100%; margin-bottom: 16px; }

    .slots-title { color: #6b7280; font-size: 14px; }

    .slots-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }

    .slot-btn {
      border-radius: 8px !important;
      font-size: 13px;
      padding: 0 12px;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 6px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }

      &.slot-btn--selected {
        background: #1565c0 !important;
        color: #fff !important;
        border-color: #1565c0 !important;
      }
    }

    .confirm-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .selected-info {
      display: flex; align-items: center; gap: 8px;
      color: #2e7d32; font-size: 14px; font-weight: 500;
      mat-icon { color: #2e7d32; }
    }

    .confirm-btn {
      align-self: flex-start;
      height: 44px;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
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
    if (id) this.loadDoctor(id);
  }

  loadDoctor(id: number): void {
    this.isLoadingDoctor = true;
    this.doctorService.getById(id).subscribe({
      next: (res) => {
        this.doctor = res.data;
        this.isLoadingDoctor = false;
      },
      error: () => { this.isLoadingDoctor = false; },
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
      error: () => { this.isLoadingSlots = false; },
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
        this.snackBar.open('Đặt lịch thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.router.navigate(['/patient/appointments']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.isBooking = false;
        this.snackBar.open(
          err?.error?.message ?? 'Đặt lịch thất bại. Vui lòng thử lại.',
          'Đóng',
          { duration: 4000, panelClass: 'error-snackbar' }
        );
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
