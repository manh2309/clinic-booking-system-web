import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RescheduleDialogComponent } from '../../../../shared/components/reschedule/reschedule-dialog.component';
import { QueueBoardComponent } from '../../../../shared/components/queue-board/queue-board.component';
import { clinicInstant, clinicDateKey } from '../../../../core/utils/clinic-time';
import { AppointmentResponse, AppointmentStatus } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-appointments', standalone: true,
  imports: [FormsModule, NgIf, NgFor, DatePipe, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatPaginatorModule, MatSnackBarModule, MatDialogModule, QueueBoardComponent, PageHeaderComponent, StatusChipComponent],
  template: `
    <app-page-header title="Lịch hẹn" subtitle="Theo dõi và xử lý lịch hẹn trong phòng khám"></app-page-header>
    <app-queue-board [admin]="true" (changed)="load()"></app-queue-board>
    <div class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Trạng thái</mat-label>
        <mat-select [(ngModel)]="status" (selectionChange)="resetPage()">
          <mat-option value="ALL">Tất cả</mat-option>
          <mat-option *ngFor="let item of statuses" [value]="item.value">{{ item.label }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Mã bác sĩ</mat-label>
        <input matInput type="number" min="1" [(ngModel)]="doctorId" />
      </mat-form-field>
      <button mat-stroked-button (click)="resetPage()">Lọc</button>
    </div>
    <p *ngIf="loading" role="status">Đang tải lịch hẹn...</p>
    <p *ngIf="error" role="alert">{{ error }} <button mat-button (click)="load()">Thử lại</button></p>
    <section class="reason-panel" *ngIf="selected">
      <h3>{{ action === 'cancel' ? 'Hủy lịch hẹn' : 'Ghi nhận vắng mặt' }} #{{ selected.id }}</h3>
      <mat-form-field appearance="outline"><mat-label>Lý do</mat-label>
        <textarea matInput [(ngModel)]="reason" maxlength="500" rows="3" [disabled]="saving"></textarea>
      </mat-form-field>
      <p *ngIf="actionError" role="alert">{{ actionError }}</p>
      <div class="actions">
        <button mat-flat-button color="warn" [disabled]="saving || !reason.trim()" (click)="submit()">Xác nhận</button>
        <button mat-button [disabled]="saving" (click)="selected = null">Đóng</button>
      </div>
    </section>
    <p *ngIf="!loading && !error && appointments.length === 0">Không có lịch hẹn phù hợp.</p>
    <section class="list" *ngIf="!loading && !error">
      <article *ngFor="let appt of appointments">
        <div><strong>#{{ appt.id }} · {{ appt.patientFullName || ('Bệnh nhân #' + appt.patientAccountId) }}</strong>
          <p>{{ appt.patientPhone || 'Chưa có số điện thoại' }}</p>
          <p>Bác sĩ: {{ appt.doctorName }}</p>
        </div>
        <div><strong>{{ appt.startAt | date:'dd/MM/yyyy HH:mm' }} – {{ appt.endAt | date:'HH:mm' }}</strong>
          <p><app-status-chip [status]="mapStatus(appt.status)"></app-status-chip></p>
          <p *ngIf="appt.statusReason">{{ appt.statusReason }}</p>
          <p *ngIf="appt.visit">{{ visitLabel(appt) }} · Tiếp nhận {{appt.visit.checkedInAt | date:'dd/MM/yyyy HH:mm'}}</p>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" *ngIf="canCheckIn(appt)" [disabled]="saving" (click)="checkIn(appt)">Tiếp nhận bệnh nhân</button>
          <button mat-stroked-button (click)="reschedule(appt)">Đổi giờ / Lịch sử</button>
          <button mat-stroked-button color="warn" *ngIf="canCancel(appt)" (click)="open(appt, 'cancel')">Hủy lịch</button>
          <button mat-stroked-button *ngIf="canNoShow(appt)" (click)="open(appt, 'no-show')">Vắng mặt</button>
        </div>
      </article>
      <mat-paginator [length]="total" [pageIndex]="page" [pageSize]="size" [pageSizeOptions]="[10,20,50]" (page)="changePage($event)"></mat-paginator>
    </section>
  `,
  styles: [`
    .filters,.actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.filters{margin:20px 0}
    .list,.reason-panel{background:white;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
    article{display:grid;grid-template-columns:1fr 1fr auto;gap:20px;padding:20px;border-bottom:1px solid #e2e8f0}
    p{color:#475569;overflow-wrap:anywhere}strong{color:#0f172a}.reason-panel{padding:20px;margin-bottom:20px}
    .reason-panel mat-form-field{width:100%;max-width:600px}article>*{min-width:0}
    @media(max-width:800px){article{grid-template-columns:1fr}.filters mat-form-field{width:100%}}
  `],
})
export class AdminAppointmentsComponent implements OnInit {
  @ViewChild(QueueBoardComponent) queue?: QueueBoardComponent;
  appointments: AppointmentResponse[] = [];
  status: 'ALL' | AppointmentStatus = 'ALL';
  doctorId: number | null = null;
  page = 0; size = 20; total = 0;
  loading = false; saving = false; error = ''; actionError = '';
  selected: AppointmentResponse | null = null;
  action: 'cancel' | 'no-show' = 'cancel';
  reason = '';
  statuses: {value: AppointmentStatus; label: string}[] = [
    {value:'PENDING',label:'Chờ xác nhận'},{value:'CONFIRMED',label:'Đã xác nhận'},
    {value:'COMPLETED',label:'Hoàn thành'},{value:'CANCELED',label:'Đã hủy'},
    {value:'EXPIRED',label:'Hết hạn'},{value:'NO_SHOW',label:'Vắng mặt'},
  ];

  constructor(private service: AppointmentService, private snackBar: MatSnackBar, private dialog: MatDialog) {}
  reschedule(appointment: AppointmentResponse): void {
    this.dialog.open(RescheduleDialogComponent, {width:'680px', maxWidth:'95vw', data:{appointment,admin:true}})
      .afterClosed().subscribe(() => this.load());
  }
  ngOnInit(): void { this.load(); }
  resetPage(): void { this.page = 0; this.load(); }
  changePage(event: PageEvent): void { this.page = event.pageIndex; this.size = event.pageSize; this.load(); }

  load(): void {
    if (this.doctorId != null && (!Number.isInteger(this.doctorId) || this.doctorId < 1)) {
      this.error = 'Mã bác sĩ phải là số nguyên dương.'; return;
    }
    this.loading = true; this.error = '';
    this.service.getAdminAppointments(this.page, this.size, this.status === 'ALL' ? undefined : this.status, this.doctorId ?? undefined).subscribe({
      next: res => { this.appointments = res.data.content; this.total = res.data.totalElements; this.loading = false; },
      error: err => { this.error = err?.error?.message ?? 'Không thể tải lịch hẹn.'; this.loading = false; },
    });
  }

  canCancel(appt: AppointmentResponse): boolean {
    return !this.received(appt) && (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && new Date(appt.startAt).getTime() > Date.now();
  }
  canNoShow(appt: AppointmentResponse): boolean {
    return !this.received(appt) && appt.status === 'CONFIRMED' && new Date(appt.endAt).getTime() <= Date.now();
  }
  received(a: AppointmentResponse): boolean { return a.visit?.status === 'WAITING' || a.visit?.status === 'IN_PROGRESS'; }
  canCheckIn(a: AppointmentResponse): boolean {
    const now = Date.now();
    return a.status === 'CONFIRMED' && (!a.visit || a.visit.status === 'CANCELED') && clinicDateKey(clinicInstant(a.startAt)) === clinicDateKey(now)
      && now >= clinicInstant(a.startAt) - 30 * 60000 && now <= clinicInstant(a.endAt) + 60 * 60000;
  }
  visitLabel(a: AppointmentResponse): string {
    return {WAITING:'Đang chờ khám',IN_PROGRESS:'Đang khám',COMPLETED:'Đã khám xong',CANCELED:'Đã rút tiếp nhận'}[a.visit!.status];
  }
  checkIn(a: AppointmentResponse): void {
    if (this.saving || !this.canCheckIn(a)) return;
    this.saving = true;
    this.service.checkIn(a.id).subscribe({
      next: () => { this.saving = false; this.load(); this.queue?.load(); this.snackBar.open('Đã tiếp nhận bệnh nhân vào hàng chờ.', 'Đóng', {duration:3000}); },
      error: err => { this.saving = false; this.snackBar.open(err?.error?.message ?? 'Chưa xác định được kết quả. Hãy tải lại lịch hẹn trước khi thử lại.', 'Đóng', {duration:5000}); this.load(); },
    });
  }
  open(appt: AppointmentResponse, action: 'cancel' | 'no-show'): void {
    if (this.saving) return;
    this.selected = appt; this.action = action; this.reason = ''; this.actionError = '';
  }
  submit(): void {
    if (!this.selected || this.saving || !this.reason.trim()) return;
    this.saving = true; this.actionError = '';
    this.service.resolveByAdmin(this.selected.id, this.action, this.reason.trim()).subscribe({
      next: () => { this.saving = false; this.selected = null; this.snackBar.open('Đã cập nhật lịch hẹn', 'Đóng', {duration:3000}); this.load(); },
      error: err => { this.saving = false; this.actionError = err?.error?.message ?? 'Không thể cập nhật lịch hẹn.'; },
    });
  }
  mapStatus(status: AppointmentStatus): StatusType {
    const values: Record<AppointmentStatus, StatusType> = {PENDING:'pending',CONFIRMED:'confirmed',COMPLETED:'completed',CANCELED:'cancelled',EXPIRED:'expired',NO_SHOW:'no-show'};
    return values[status];
  }
}
