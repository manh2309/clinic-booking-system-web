import { Component, OnInit } from '@angular/core';
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
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatPaginatorModule, MatDialogModule, MatSnackBarModule,
    NgIf, NgFor, DatePipe,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, StatusChipComponent,
  ],
  template: `
    <div>
      <app-page-header title="Lịch hẹn của tôi" subtitle="Danh sách các buổi khám đã đặt"></app-page-header>

      <app-loading *ngIf="isLoading" message="Đang tải lịch hẹn..."></app-loading>

      <div *ngIf="!isLoading">
        <app-empty-state
          *ngIf="appointments.length === 0"
          icon="calendar_today"
          title="Chưa có lịch hẹn nào"
          message="Hãy tìm bác sĩ và đặt lịch khám ngay"
          actionLabel="Tìm bác sĩ"
          (actionClicked)="goToDoctors()"
        ></app-empty-state>

        <div class="appointments-list" *ngIf="appointments.length > 0">
          <mat-card class="appt-card" *ngFor="let appt of appointments">
            <mat-card-content>
              <div class="appt-header">
                <div class="appt-info">
                  <div class="appt-doctor">
                    <mat-icon>person</mat-icon>
                    <span>{{ appt.doctorName ?? 'Bác sĩ #' + appt.doctorId }}</span>
                  </div>
                  <div class="appt-time">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ appt.startAt | date:'HH:mm' }} – {{ appt.endAt | date:'HH:mm' }}</span>
                    <span class="appt-date">{{ appt.startAt | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
                <app-status-chip [status]="mapStatus(appt.status)"></app-status-chip>
              </div>

              <div class="appt-actions" *ngIf="canCancel(appt.status)">
                <button mat-stroked-button color="warn" (click)="cancelAppointment(appt)">
                  <mat-icon>cancel</mat-icon>
                  Hủy lịch
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-paginator
          *ngIf="totalElements > pageSize"
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          (page)="onPageChange($event)"
          showFirstLastButtons
        ></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .appt-card { border-radius: 12px; }

    .appt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .appt-info { flex: 1; }

    .appt-doctor {
      display: flex; align-items: center; gap: 8px;
      font-size: 16px; font-weight: 600; color: #1a1a2e;
      margin-bottom: 6px;
      mat-icon { color: #1565c0; }
    }

    .appt-time {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; color: #6b7280;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .appt-date {
      padding-left: 8px;
      border-left: 1px solid #e5e7eb;
    }

    .appt-actions { margin-top: 12px; }
  `],
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: { navigate: (commands: string[]) => void } & { navigate: (c: string[]) => void }
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getMine(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.appointments = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
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
    const map: Record<AppointmentStatus, StatusType> = {
      PENDING:   'pending',
      CONFIRMED: 'confirmed',
      COMPLETED: 'completed',
      CANCELED:  'cancelled',
    };
    return map[status] ?? 'pending';
  }

  cancelAppointment(appt: AppointmentResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Hủy lịch hẹn',
        message: `Bạn có chắc muốn hủy lịch khám lúc ${new Date(appt.startAt).toLocaleString('vi-VN')} không?`,
        confirmLabel: 'Hủy lịch',
        cancelLabel: 'Giữ lại',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.appointmentService.cancel(appt.id).subscribe({
        next: () => {
          this.snackBar.open('Đã hủy lịch hẹn', 'Đóng', { duration: 3000 });
          this.loadAppointments();
        },
        error: (err: { error?: { message?: string } }) => {
          this.snackBar.open(err?.error?.message ?? 'Hủy thất bại', 'Đóng', { duration: 3000 });
        },
      });
    });
  }

  goToDoctors(): void {
    (this.router as { navigate: (c: string[]) => void }).navigate(['/patient/doctors']);
  }
}
