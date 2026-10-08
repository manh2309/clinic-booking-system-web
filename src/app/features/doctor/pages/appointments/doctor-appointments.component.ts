import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentResponse, AppointmentStatus, UpdateAppointmentStatusRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatPaginatorModule, MatSnackBarModule,
    NgIf, NgFor, DatePipe,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, StatusChipComponent,
  ],
  template: `
    <div>
      <app-page-header title="Lịch hẹn" subtitle="Danh sách bệnh nhân đặt lịch khám"></app-page-header>

      <app-loading *ngIf="isLoading" message="Đang tải lịch hẹn..."></app-loading>

      <div *ngIf="!isLoading">
        <app-empty-state
          *ngIf="appointments.length === 0"
          icon="event_busy"
          title="Chưa có lịch hẹn nào"
          message="Bệnh nhân chưa đặt lịch khám với bạn"
        ></app-empty-state>

        <div class="appointments-list" *ngIf="appointments.length > 0">
          <mat-card class="appt-card" *ngFor="let appt of appointments">
            <mat-card-content>
              <div class="appt-row">
                <!-- Time -->
                <div class="appt-time">
                  <div class="time-val">{{ appt.startAt | date:'HH:mm' }}</div>
                  <div class="date-val">{{ appt.startAt | date:'dd/MM/yyyy' }}</div>
                </div>

                <!-- Patient info -->
                <div class="appt-patient">
                  <mat-icon>person</mat-icon>
                  <div>
                    <div class="patient-name">Bệnh nhân #{{ appt.patientAccountId }}</div>
                    <div class="patient-time">{{ appt.startAt | date:'HH:mm' }} – {{ appt.endAt | date:'HH:mm' }}</div>
                  </div>
                </div>

                <!-- Status + Actions -->
                <div class="appt-actions">
                  <app-status-chip [status]="mapStatus(appt.status)"></app-status-chip>

                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" *ngIf="canAct(appt.status)">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu>
                    <button mat-menu-item (click)="updateStatus(appt, 'CONFIRMED')"
                      *ngIf="appt.status === 'PENDING'">
                      <mat-icon>check_circle</mat-icon>
                      Xác nhận
                    </button>
                    <button mat-menu-item (click)="updateStatus(appt, 'COMPLETED')"
                      *ngIf="appt.status === 'CONFIRMED'">
                      <mat-icon>task_alt</mat-icon>
                      Hoàn thành
                    </button>
                    <button mat-menu-item (click)="updateStatus(appt, 'CANCELED')"
                      *ngIf="appt.status === 'PENDING' || appt.status === 'CONFIRMED'">
                      <mat-icon color="warn">cancel</mat-icon>
                      <span style="color:#dc2626">Hủy</span>
                    </button>
                  </mat-menu>
                </div>
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
    .appointments-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

    .appt-card { border-radius: 12px; }

    .appt-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .appt-time {
      min-width: 64px;
      text-align: center;
      padding: 8px;
      background: #f0f4ff;
      border-radius: 8px;
    }

    .time-val { font-size: 18px; font-weight: 700; color: #1565c0; }
    .date-val { font-size: 11px; color: #6b7280; }

    .appt-patient {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      mat-icon { color: #9ca3af; }
    }

    .patient-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    .patient-time { font-size: 12px; color: #6b7280; }

    .appt-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `],
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  isLoading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.appointmentService.getDoctorAppointments(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.appointments = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  canAct(status: AppointmentStatus): boolean {
    return status !== 'COMPLETED' && status !== 'CANCELED';
  }

  mapStatus(s: string): StatusType {
    const m: Record<string, StatusType> = {
      PENDING: 'pending', CONFIRMED: 'confirmed', COMPLETED: 'completed', CANCELED: 'cancelled',
    };
    return m[s] ?? 'pending';
  }

  updateStatus(appt: AppointmentResponse, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(appt.id, { status }).subscribe({
      next: (res) => {
        appt.status = res.data.status;
        this.snackBar.open('Cập nhật trạng thái thành công!', 'Đóng', { duration: 3000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }
}
