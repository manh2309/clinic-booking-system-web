import {DoctorPickerComponent} from '../../../../shared/components/doctor-picker/doctor-picker.component';
import { ListToolsComponent, ListFilters } from '../../../../shared/components/list-tools/list-tools.component';
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
  imports: [DoctorPickerComponent,ListToolsComponent,FormsModule, NgIf, NgFor, DatePipe, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatPaginatorModule, MatSnackBarModule, MatDialogModule, QueueBoardComponent, PageHeaderComponent, StatusChipComponent],
  template: `
    <app-page-header title="Lịch hẹn" subtitle="Theo dõi và xử lý lịch hẹn trong phòng khám"></app-page-header>
    <nav class="view-tabs">
      <button mat-stroked-button (click)="view='appointments'" [class.selected]="view==='appointments'">Danh sách lịch hẹn</button>
      <button mat-stroked-button (click)="view='queue'" [class.selected]="view==='queue'">Tiếp nhận và hàng chờ</button>
    </nav>
    <div [hidden]="view!=='queue'"><app-queue-board [admin]="true" (changed)="load()"></app-queue-board></div>
    <div [hidden]="view!=='appointments'">
    <form class="filters" (ngSubmit)="resetPage()">
      <label class="keyword">Tìm lịch hẹn<input name="keyword" [(ngModel)]="filters.keyword" placeholder="Tên bệnh nhân, số điện thoại hoặc mã lịch" maxlength="100"></label>
      <label>Trạng thái<select name="status" [(ngModel)]="status"><option value="ALL">Tất cả trạng thái</option><option *ngFor="let item of statuses" [value]="item.value">{{item.label}}</option></select></label>
      <app-doctor-picker [value]="doctorId" (valueChange)="doctorId=$event"></app-doctor-picker>
      <label>Từ ngày<input type="date" name="from" [(ngModel)]="filters.from"></label>
      <label>Đến ngày<input type="date" name="to" [(ngModel)]="filters.to"></label>
      <div class="filter-actions"><button mat-flat-button color="primary" type="submit">Tìm kiếm</button><button mat-button type="button" (click)="clearFilters()">Xóa bộ lọc</button></div>
    </form>
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
      <div class="list-heading"><span>Bệnh nhân / Bác sĩ</span><span>Thời gian / Trạng thái</span><span>Thao tác</span></div>
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
    </section></div>
  `,
  styles: [`
    :host{display:block}.view-tabs{display:flex;gap:6px;margin:20px 0;background:#eaf0f6;padding:5px;border-radius:12px;width:fit-content;max-width:100%;flex-wrap:wrap}.view-tabs button{border:0;border-radius:9px;letter-spacing:normal}.view-tabs .selected{background:white;color:#0369a1;box-shadow:0 1px 4px #0f172a12}
    .filters{display:grid;grid-template-columns: minmax(220px,2fr) repeat(2,minmax(170px,1fr));gap:16px;padding:20px;background:white;border:1px solid #e2e8f0;border-radius:14px;margin:20px 0 24px;align-items:end}.filters label{display:grid;gap:8px;font-size:13px;color:#475569;min-width:0}.filters input,.filters select{width:100%;min-height:44px;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:9px;padding:10px 12px;background:white;font:inherit;color:#0f172a}.filter-actions,.actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}button{letter-spacing:normal}.filter-actions button{min-height:44px}
    .list,.reason-panel{background:white;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.list-heading,article{display:grid;grid-template-columns:minmax(180px,1fr) minmax(210px,1fr) minmax(200px,1fr);gap:20px;padding:16px 20px;border-bottom:1px solid #e2e8f0}.list-heading{background:#f8fafc;font-size:12px;font-weight:600;color:#64748b}article{align-items:center}article p{margin:7px 0;font-size:13px;line-height:1.5}article strong{font-size:14px}p{color:#475569;overflow-wrap:anywhere}strong{color:#0f172a}.reason-panel{padding:20px;margin-bottom:20px}.reason-panel mat-form-field{width:100%;max-width:600px}article>*{min-width:0}.actions button{font-size:12px;border-radius:8px;min-height:36px}
    @media(max-width:1000px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.keyword{grid-column:1/-1}.list-heading{display:none}article{grid-template-columns:1fr 1fr}.actions{grid-column:1/-1}}@media(max-width:600px){.filters{grid-template-columns:1fr;padding:16px}.keyword{grid-column:auto}article{grid-template-columns:1fr;padding:16px}.view-tabs{width:auto}.view-tabs button{flex:1}.filter-actions button{flex:1}}
  `],
})
export class AdminAppointmentsComponent implements OnInit {
  view = 'appointments';
  @ViewChild(QueueBoardComponent) queue?: QueueBoardComponent;
  filters: ListFilters = {keyword:'',active:'',from:'',to:''};
  clearFilters(): void { this.filters={keyword:'',active:'',from:'',to:''}; this.status='ALL'; this.doctorId=null; this.resetPage(); }
  searchList(value: ListFilters): void { this.filters=value; this.resetPage(); }
  appointments: AppointmentResponse[] = [];
  status: 'ALL' | AppointmentStatus = 'ALL';
  doctorId: number | null = null;
  page = 0; size = 10; total = 0;
  loading = false; saving = false; error = ''; actionError = '';
  selected: AppointmentResponse | null = null;
  action: 'cancel' | 'no-show' = 'cancel';
  reason = '';
  private listRequest = 0;
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
    const request = ++this.listRequest;
    if (this.doctorId != null && (!Number.isInteger(this.doctorId) || this.doctorId < 1)) {
      this.loading = false; this.error = 'Mã bác sĩ phải là số nguyên dương.'; return;
    }
    this.loading = true; this.error = '';
    this.service.getAdminAppointments(this.page, this.size, this.status === 'ALL' ? undefined : this.status, this.doctorId ?? undefined, this.filters).subscribe({
      next: res => { if (request !== this.listRequest) return; this.appointments = res.data.content; this.total = res.data.totalElements; this.loading = false; },
      error: err => { if (request !== this.listRequest) return; this.error = err?.error?.message ?? 'Không thể tải lịch hẹn.'; this.loading = false; },
    });
  }

  canCancel(appt: AppointmentResponse): boolean {
    return !this.received(appt) && (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && clinicInstant(appt.startAt) > Date.now();
  }
  canNoShow(appt: AppointmentResponse): boolean {
    return !this.received(appt) && appt.status === 'CONFIRMED' && clinicInstant(appt.endAt) <= Date.now();
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
