import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    NgIf,
    NgFor,
    DatePipe,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
    StatusChipComponent,
  ],
  template: `
    <div class="patient-appts-page fade-in">
      <app-page-header
        title="Lịch khám bệnh của tôi"
        subtitle="Quản lý và theo dõi trạng thái các cuộc hẹn khám tại ClinicCare"
      ></app-page-header>

      <!-- FILTER TABS -->
      <div class="filter-tabs-bar">
        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedStatusFilter === 'ALL'"
          (click)="setStatusFilter('ALL')"
        >
          <span>Tất cả</span>
          <span class="count-pill">{{ appointments.length }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedStatusFilter === 'PENDING'"
          (click)="setStatusFilter('PENDING')"
        >
          <span>Chờ xác nhận</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedStatusFilter === 'CONFIRMED'"
          (click)="setStatusFilter('CONFIRMED')"
        >
          <span>Đã xác nhận</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedStatusFilter === 'COMPLETED'"
          (click)="setStatusFilter('COMPLETED')"
        >
          <span>Hoàn thành</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="selectedStatusFilter === 'CANCELED'"
          (click)="setStatusFilter('CANCELED')"
        >
          <span>Đã hủy</span>
        </button>
      </div>

      <!-- LOADING -->
      <app-loading *ngIf="isLoading" message="Đang tải danh sách lịch khám..."></app-loading>

      <!-- ERROR STATE -->
      <div class="error-banner" *ngIf="!isLoading && hasError">
        <mat-icon class="err-icon">error_outline</mat-icon>
        <div class="err-text">
          <strong>Không thể tải danh sách lịch khám</strong>
          <p>{{ errorMessage }}</p>
        </div>
        <button mat-stroked-button color="warn" (click)="loadAppointments()">
          <mat-icon>refresh</mat-icon>
          Thử lại
        </button>
      </div>

      <!-- MAIN LIST -->
      <div *ngIf="!isLoading && !hasError">
        <app-empty-state
          *ngIf="filteredAppointments.length === 0"
          icon="calendar_today"
          title="Chưa có lịch khám nào trong danh mục này"
          message="Bạn chưa có lịch hẹn khám nào. Hãy tìm kiếm bác sĩ chuyên khoa và đặt lịch khám ngay hôm nay!"
          actionLabel="Tìm bác sĩ ngay"
          (actionClicked)="goToDoctors()"
        ></app-empty-state>

        <!-- APPOINTMENTS LIST TILES -->
        <div class="appointments-list" *ngIf="filteredAppointments.length > 0">
          <div class="appt-ticket-card" *ngFor="let appt of filteredAppointments">
            <!-- Left Date & Time Block -->
            <div class="ticket-date-block">
              <span class="ticket-month">{{ appt.startAt | date:'MMMM' }}</span>
              <span class="ticket-day">{{ appt.startAt | date:'dd' }}</span>
              <span class="ticket-year">{{ appt.startAt | date:'yyyy' }}</span>
              <div class="ticket-time-badge">
                <mat-icon>schedule</mat-icon>
                <span>{{ appt.startAt | date:'HH:mm' }} - {{ appt.endAt | date:'HH:mm' }}</span>
              </div>
            </div>

            <!-- Middle Info Details -->
            <div class="ticket-details">
              <div class="ticket-meta-top">
                <span class="ticket-code">Mã phiếu: #LK-{{ appt.id }}</span>
                <app-status-chip [status]="mapStatus(appt.status)"></app-status-chip>
              </div>

              <div class="ticket-doctor">
                <div class="doc-icon-wrap">
                  <mat-icon>medical_services</mat-icon>
                </div>
                <div>
                  <h3 class="doc-name">{{ appt.doctorName ?? 'Bác sĩ chuyên khoa #' + appt.doctorId }}</h3>
                  <p class="doc-clinic">Phòng khám ClinicCare — Khoa Khám bệnh</p>
                </div>
              </div>

              <div class="ticket-note">
                <mat-icon>info</mat-icon>
                <span>Vui lòng đến trước giờ hẹn 15 phút để hoàn tất thủ tục tiếp đón.</span>
              </div>
            </div>

            <!-- Right Action Block -->
            <div class="ticket-actions">
              <button
                *ngIf="canCancel(appt.status)"
                mat-stroked-button
                color="warn"
                (click)="cancelAppointment(appt)"
                class="btn-cancel"
              >
                <mat-icon>close</mat-icon>
                <span>Hủy lịch hẹn</span>
              </button>

              <button
                *ngIf="appt.status === 'COMPLETED' || appt.status === 'CANCELED'"
                mat-flat-button
                color="primary"
                (click)="goToDoctors()"
                class="btn-rebook"
              >
                <mat-icon>refresh</mat-icon>
                <span>Đặt lại lịch</span>
              </button>
            </div>
          </div>
        </div>

        <div class="paginator-wrap" *ngIf="totalElements > pageSize">
          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-appts-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* FILTER TABS */
    .filter-tabs-bar {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      &.active {
        background: #0284c7;
        color: #ffffff;
        border-color: #0284c7;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);

        .count-pill {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }
      }
    }

    .count-pill {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 700;
    }

    /* LIST */
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* TICKET CARD */
    .appt-ticket-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      display: grid;
      grid-template-columns: 200px 1fr 180px;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(2, 132, 199, 0.12);
        border-color: #7dd3fc;
      }
    }

    /* DATE BLOCK */
    .ticket-date-block {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-right: 1px dashed #bae6fd;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .ticket-month {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0284c7;
      letter-spacing: 0.05em;
    }

    .ticket-day {
      font-size: 38px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin: 2px 0;
    }

    .ticket-year {
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 12px;
    }

    .ticket-time-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      color: #0284c7;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15);

      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    /* DETAILS */
    .ticket-details {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
    }

    .ticket-meta-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ticket-code {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      background: #f1f5f9;
      padding: 3px 10px;
      border-radius: 6px;
    }

    .ticket-doctor {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .doc-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #e0f2fe;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { color: #0284c7; font-size: 24px; width: 24px; height: 24px; }
    }

    .doc-name {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 2px;
      letter-spacing: -0.02em;
    }

    .doc-clinic {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }

    .ticket-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #0369a1;
      background: #f0f9ff;
      padding: 8px 14px;
      border-radius: 8px;

      mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; }
    }

    /* ACTIONS */
    .ticket-actions {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-left: 1px solid #f1f5f9;
      gap: 10px;
    }

    .btn-cancel {
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      width: 100%;
    }

    .btn-rebook {
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      width: 100%;
    }

    .paginator-wrap {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }

    @media (max-width: 900px) {
      .appt-ticket-card {
        grid-template-columns: 1fr;
      }
      .ticket-date-block {
        border-right: none;
        border-bottom: 1px dashed #bae6fd;
      }
      .ticket-actions {
        border-left: none;
        border-top: 1px solid #f1f5f9;
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
      margin-bottom: 20px;

      .err-icon { color: #ef4444; font-size: 22px; width: 22px; height: 22px; }
      .err-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }
  `],
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  selectedStatusFilter: 'ALL' | AppointmentStatus = 'ALL';
  isLoading = false;
  hasError = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.appointmentService.getMine(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.appointments = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải lịch khám.';
      },
    });
  }

  setStatusFilter(status: 'ALL' | AppointmentStatus): void {
    this.selectedStatusFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStatusFilter === 'ALL') {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === this.selectedStatusFilter
      );
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  canCancel(status: AppointmentStatus): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  mapStatus(status: AppointmentStatus): StatusType {
    switch (status) {
      case 'PENDING':   return 'pending';
      case 'CONFIRMED': return 'confirmed';
      case 'COMPLETED': return 'completed';
      case 'CANCELED':  return 'cancelled';
      default:          return 'pending';
    }
  }

  cancelAppointment(appt: AppointmentResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Xác nhận hủy lịch khám',
        message: `Bạn có chắc chắn muốn hủy lịch khám với ${
          appt.doctorName ?? 'bác sĩ'
        } vào lúc ${appt.startAt?.replace('T', ' ')}?`,
        confirmText: 'Xác nhận hủy',
        cancelText: 'Giữ lịch hẹn',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.appointmentService.cancel(appt.id).subscribe({
        next: () => {
          this.snackBar.open('Đã hủy lịch khám thành công', 'Đóng', { duration: 3000 });
          this.loadAppointments();
        },
        error: (err: { error?: { message?: string } }) => {
          this.snackBar.open(err?.error?.message ?? 'Hủy lịch thất bại', 'Đóng', {
            duration: 3000,
          });
        },
      });
    });
  }

  goToDoctors(): void {
    this.router.navigate(['/patient/doctors']);
  }
}
