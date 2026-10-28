import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppointmentResponse, DoctorResponse, QueueBoard, VisitResponse } from '../../../core/models/domain.model';
import { clinicInstant, clinicDateKey } from '../../../core/utils/clinic-time';

@Component({
  selector:'app-queue-board', standalone:true,
  imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatPaginatorModule],
  template:`
    <section class="queue-board">
      <header><div><h2>{{admin ? 'Tiếp nhận và hàng chờ' : 'Hàng chờ khám'}}</h2>
        <p>Thứ tự gợi ý theo giờ hẹn và thời điểm có mặt. Bệnh nhân đến muộn được xếp theo lúc đến.</p></div>
        <button mat-stroked-button (click)="load()" [disabled]="loading || busy || (admin && !doctorId)">Làm mới hàng chờ</button>
      </header>
      <div class="filters">
        <ng-container *ngIf="admin">
          <label>Bác sĩ<select [(ngModel)]="doctorId" (ngModelChange)="reset()" [disabled]="busy || doctorsLoading">
            <option [ngValue]="undefined">Chọn bác sĩ</option>
            <option *ngFor="let d of doctors" [ngValue]="d.id">{{d.fullName}} · {{d.specialtyName}}</option>
          </select></label>
          <button mat-button (click)="loadDoctors(-1)" [disabled]="doctorPage === 0 || doctorsLoading || busy">Bác sĩ trước</button>
          <button mat-button (click)="loadDoctors(1)" [disabled]="doctorLast || doctorsLoading || busy">Bác sĩ sau</button>
          <a mat-button routerLink="/admin/appointments">Tiếp nhận từ lịch hẹn</a>
        </ng-container>
        <label>Ngày khám<input type="date" [(ngModel)]="date" (ngModelChange)="reset()" [disabled]="busy" /></label>
      </div>
      <p role="alert" *ngIf="doctorsError">{{doctorsError}} <button mat-button (click)="loadDoctors(0)">Thử lại</button></p>
      <p *ngIf="loading" role="status">Đang tải hàng chờ...</p>
      <p role="alert" *ngIf="error">{{error}}</p>
      <p role="alert" *ngIf="actionError">{{actionError}}</p>
      <ng-container *ngIf="board && !error && !loading">
        <article class="active" *ngIf="board.activeVisit as active">
          <h3>Đang khám · Lịch #{{active.appointmentId}}</h3>
          <strong>{{active.patientName}}</strong><p>Giờ hẹn: {{active.appointmentStartAt | date:'dd/MM/yyyy HH:mm'}}</p>
          <p>Bắt đầu lúc {{active.startedAt | date:'dd/MM/yyyy HH:mm'}}</p>
          <button mat-flat-button color="primary" *ngIf="!admin" [disabled]="busy || !canWrite" (click)="complete.emit(asAppointment(active))">Ghi kết quả và hoàn thành</button>
        </article>
        <h3>Đang chờ · {{board.waiting.totalElements}} bệnh nhân</h3>
        <p *ngIf="!board.waiting.content.length">Không có bệnh nhân đang chờ trong ngày đã chọn.</p>
        <article *ngFor="let v of board.waiting.content; let i = index">
          <div><strong>{{page * 20 + i + 1}} · {{v.patientName}} · Lịch #{{v.appointmentId}}</strong>
            <p>Giờ hẹn {{v.appointmentStartAt | date:'HH:mm'}}–{{v.appointmentEndAt | date:'HH:mm'}} · Có mặt {{v.checkedInAt | date:'HH:mm'}}</p>
            <p *ngIf="v.patientPhone">{{v.patientPhone}}</p>
          </div>
          <button mat-flat-button color="primary" *ngIf="!admin" (click)="start(v)" [disabled]="busy || !canWrite || !!board.activeVisit || !canStart(v)">Bắt đầu khám</button>
          <p *ngIf="!admin && !canStart(v)" class="hint">Chưa đến giờ khám hoặc không thuộc ngày hôm nay.</p>
          <button mat-stroked-button *ngIf="admin" [disabled]="busy" (click)="cancelTarget = v; reason = ''">Rút tiếp nhận</button>
        </article>
        <mat-paginator *ngIf="board.waiting.totalElements > 20" [length]="board.waiting.totalElements" [pageSize]="20" [pageIndex]="page" (page)="paginate($event)"></mat-paginator>
      </ng-container>
      <section class="cancel-panel" *ngIf="cancelTarget">
        <h3>Rút tiếp nhận · Lịch #{{cancelTarget.appointmentId}}</h3>
        <p>Chỉ áp dụng khi chưa bắt đầu khám. Thao tác này không tự hủy lịch hẹn.</p>
        <label>Lý do<textarea rows="3" maxlength="500" [(ngModel)]="reason" [disabled]="busy"></textarea></label>
        <button mat-flat-button color="warn" [disabled]="busy || !reason.trim()" (click)="cancelReception()">Xác nhận rút tiếp nhận</button>
        <button mat-button [disabled]="busy" (click)="cancelTarget = null">Đóng</button>
      </section>
    </section>
  `,
  styles:[`
    .queue-board{background:white;border:1px solid #dbe5ee;border-radius:16px;padding:20px;margin-bottom:24px}header,.filters{display:flex;align-items:center;gap:12px;flex-wrap:wrap}header{justify-content:space-between}h2{font-size:21px;margin:0}h3{font-size:17px}p{color:#475569;line-height:1.5;overflow-wrap:anywhere}label{display:block}input,select,textarea{font:inherit;border:1px solid #cbd5e1;border-radius:8px;padding:10px;max-width:100%;box-sizing:border-box;display:block;margin:6px 0}article{border:1px solid #dbe5ee;border-radius:12px;padding:16px;margin:12px 0}article.active{background:#effaf8;border-color:#99d5cd}.hint{font-size:13px}.cancel-panel{padding:16px;border:1px solid #fed7aa;border-radius:12px}textarea{width:100%}[role=alert]{color:#b91c1c}@media(max-width:600px){.queue-board{padding:14px}.filters{display:block}.filters select,.filters input{width:100%}}
  `],
})
export class QueueBoardComponent implements OnInit, OnDestroy {
  @Input() admin = false;
  @Input() canWrite = true;
  @Output() complete = new EventEmitter<AppointmentResponse>();
  @Output() changed = new EventEmitter<void>();
  board: QueueBoard | null = null;
  date = clinicDateKey();
  doctorId?: number; doctors: DoctorResponse[] = []; doctorPage = 0; doctorLast = true;
  doctorsLoading = false; doctorsError = ''; loading = false; busy = false;
  error = ''; actionError = ''; page = 0; reason = ''; cancelTarget: VisitResponse | null = null;
  now = Date.now();
  private clock?: ReturnType<typeof setInterval>;
  private requests = new Subscription(); private queueRequest?: Subscription;
  constructor(private appointments: AppointmentService, private doctorService: DoctorService, private notifications: NotificationService) {}
  ngOnInit(): void { if (this.admin) this.loadDoctors(0); else this.load(); this.clock = setInterval(() => this.now = Date.now(), 1000); }
  ngOnDestroy(): void { this.requests.unsubscribe(); this.queueRequest?.unsubscribe(); if (this.clock) clearInterval(this.clock); }
  loadDoctors(delta: number): void {
    if (this.busy || this.doctorsLoading) return;
    const targetPage = Math.max(0, this.doctorPage + delta); this.doctorsLoading = true; this.doctorsError = '';
    this.requests.add(this.doctorService.getAllForAdmin(targetPage,20).subscribe({
      next: res => { this.doctors = res.data.content; this.doctorPage = targetPage; this.doctorLast = res.data.last; this.doctorsLoading = false;
        if (delta) { this.doctorId = undefined; this.board = null; this.queueRequest?.unsubscribe(); this.loading = false; } },
      error: () => { this.doctorsLoading = false; this.doctorsError = 'Không tải được danh sách bác sĩ.'; },
    }));
  }
  reset(): void { this.page = 0; this.cancelTarget = null; this.load(); }
  paginate(e: PageEvent): void { this.page = e.pageIndex; this.load(); }
  load(): void {
    if (this.busy) return;
    this.queueRequest?.unsubscribe(); this.board = null; this.error = '';
    if (!this.date || (this.admin && !this.doctorId)) { this.loading = false; return; }
    this.loading = true;
    this.queueRequest = this.appointments.queue(this.admin, this.date, this.page, this.doctorId).subscribe({
      next: res => { this.board = res.data; this.loading = false;
        if (this.page > 0 && !res.data.waiting.content.length) { this.page--; this.load(); } },
      error: err => { this.loading = false; this.error = err?.error?.message ?? 'Không tải được hàng chờ. Hãy làm mới để thử lại.'; },
    });
  }
  canStart(v: VisitResponse): boolean {
    return clinicDateKey(clinicInstant(v.appointmentStartAt)) === clinicDateKey(this.now) && clinicInstant(v.appointmentStartAt) <= this.now;
  }
  start(v: VisitResponse): void {
    if (this.busy || !this.canWrite || this.board?.activeVisit || !this.canStart(v)) return;
    this.busy = true; this.actionError = '';
    this.requests.add(this.appointments.startVisit(v.appointmentId).subscribe({
      next: () => { this.busy = false; this.notifications.changed.next(); this.changed.emit(); this.load(); },
      error: err => { this.busy = false; this.actionError = err?.error?.message ?? 'Chưa xác định được kết quả. Hãy làm mới trước khi thử lại.'; this.load(); },
    }));
  }
  cancelReception(): void {
    if (this.busy || !this.cancelTarget || !this.reason.trim()) return;
    this.busy = true; this.actionError = '';
    this.requests.add(this.appointments.cancelReception(this.cancelTarget.appointmentId,this.reason.trim()).subscribe({
      next: () => { this.busy = false; this.cancelTarget = null; this.notifications.changed.next(); this.changed.emit(); this.load(); },
      error: err => { this.busy = false; this.actionError = err?.error?.message ?? 'Chưa rút được tiếp nhận. Hãy làm mới trước khi thử lại.'; this.load(); },
    }));
  }
  asAppointment(v: VisitResponse): AppointmentResponse {
    return {id:v.appointmentId,doctorId:v.doctorId,doctorName:v.doctorName,patientFullName:v.patientName,patientPhone:v.patientPhone,
      startAt:v.appointmentStartAt,endAt:v.appointmentEndAt,status:'CONFIRMED',
      visit:{id:v.id,status:v.status,checkedInAt:v.checkedInAt,startedAt:v.startedAt,completedAt:v.completedAt}};
  }
}
