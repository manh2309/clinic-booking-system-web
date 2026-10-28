import { Component, Inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentResponse, AvailableDateResponse, SlotResponse } from '../../../core/models/domain.model';
import { DoctorService } from '../../../core/services/doctor.service';
import { RescheduleProposal, RescheduleService } from '../../../core/services/reschedule.service';

@Component({
  standalone: true, selector: 'app-reschedule-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Đổi giờ khám · Lịch #{{data.appointment.id}}</h2>
    <mat-dialog-content>
      <p>{{data.appointment.doctorName}} · {{data.appointment.startAt | date:'dd/MM/yyyy HH:mm'}}</p>
      <p *ngIf="data.appointment.status === 'CANCELED'">Lịch cũ đã hủy. Chấp nhận đề xuất sẽ tạo lịch đặt lại, không khôi phục lịch cũ.</p>
      <p>Giờ đề xuất chưa được giữ chỗ. Sau khi chấp nhận, lịch mới cần bác sĩ xác nhận.</p>
      <p *ngIf="loading" role="status">Đang tải đề xuất...</p>
      <p *ngIf="error" role="alert">{{error}} <button mat-button [disabled]="busy" (click)="load()">Tải lại</button></p>
      <section *ngIf="canPropose && !loading && !error && !hasPending">
        <h3>Đề xuất giờ khác với cùng bác sĩ</h3>
        <label>Ngày còn chỗ
          <select [(ngModel)]="date" (ngModelChange)="loadSlots()" [disabled]="busy || slotsLoading">
            <option value="">Chọn ngày</option>
            <option *ngFor="let day of dates" [value]="day.date">{{day.date | date:'dd/MM/yyyy'}} · {{day.availableSlots}} chỗ</option>
          </select>
        </label>
        <p *ngIf="availabilityError" role="alert">{{availabilityError}} <button mat-button (click)="loadDates()">Thử lại ngày khám</button></p>
        <p *ngIf="!dates.length && !availabilityError">Chưa có ngày còn chỗ trong 30 ngày tới.</p>
        <label>Giờ mới
          <select [(ngModel)]="slotId" [disabled]="busy || slotsLoading" (ngModelChange)="suggestDeadline()">
            <option [ngValue]="null">{{slotsLoading ? 'Đang tải giờ...' : 'Chọn giờ khám'}}</option>
            <option *ngFor="let slot of slots" [ngValue]="slot.id">{{slot.startAt | date:'HH:mm'}} – {{slot.endAt | date:'HH:mm'}}</option>
          </select>
        </label>
        <label>Hạn phản hồi theo giờ Việt Nam
          <input type="datetime-local" [(ngModel)]="expiresAt" [disabled]="busy" />
        </label>
        <p>Trong 7 ngày tới và trước giờ khám mới; nếu lịch cũ còn hiệu lực thì phải trước cả giờ khám cũ.</p>
        <label>Lý do<textarea rows="3" maxlength="500" [(ngModel)]="reason" [disabled]="busy"></textarea></label>
        <button mat-flat-button color="primary" [disabled]="busy || !slotId || !reason.trim() || !expiresAt" (click)="propose()">Gửi đề xuất</button>
      </section>
      <p *ngIf="!loading && !error && !items.length">Chưa có đề xuất đổi lịch.</p>
      <article *ngFor="let item of items">
        <strong>{{item.targetStartAt | date:'dd/MM/yyyy HH:mm'}} – {{item.targetEndAt | date:'HH:mm'}}</strong>
        <p>{{labels[state(item)]}} · Đề xuất #{{item.id}}</p>
        <p>{{item.reason}}</p>
        <p>Gửi lúc {{item.createdAt | date:'dd/MM/yyyy HH:mm'}} · Người đề xuất #{{item.proposedBy}}</p>
        <p>Hạn phản hồi: {{item.expiresAt | date:'dd/MM/yyyy HH:mm'}}</p>
        <p *ngIf="item.respondedAt">Xử lý lúc {{item.respondedAt | date:'dd/MM/yyyy HH:mm'}}</p>
        <p *ngIf="item.replacementAppointmentId">Đã tạo lịch mới #{{item.replacementAppointmentId}}. Xem tại danh sách lịch hẹn.</p>
        <div *ngIf="state(item) === 'PENDING'">
          <button mat-stroked-button *ngIf="data.admin" [disabled]="busy" (click)="respond(item, 'withdraw')">Rút đề xuất</button>
          <ng-container *ngIf="!data.admin">
            <button mat-flat-button color="primary" [disabled]="busy" (click)="confirming = item.id">Chọn giờ mới</button>
            <button mat-button [disabled]="busy" (click)="respond(item, 'decline')">Từ chối đề xuất</button>
            <section *ngIf="confirming === item.id" class="confirm">
              <p>Bạn đồng ý chuyển sang giờ này? Lịch cũ còn hiệu lực sẽ bị hủy sau khi đặt lịch mới thành công.</p>
              <button mat-flat-button color="primary" [disabled]="busy" (click)="respond(item, 'accept')">Đồng ý đổi giờ</button>
              <button mat-button [disabled]="busy" (click)="confirming = null">Quay lại</button>
            </section>
          </ng-container>
        </div>
      </article>
      <p *ngIf="actionError" role="alert">{{actionError}}</p>
      <p *ngIf="success" role="status">{{success}}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button [disabled]="busy" (click)="close()">Đóng</button></mat-dialog-actions>
  `,
  styles: [`label{display:block;margin:12px 0}input,select,textarea{display:block;width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font:inherit;margin-top:5px}article{border:1px solid #dbe5ee;border-radius:12px;padding:16px;margin:14px 0}p{line-height:1.5;overflow-wrap:anywhere}section{margin-bottom:18px}.confirm{background:#eef8fb;padding:12px;border-radius:8px}[role=alert]{color:#b91c1c}[role=status]{color:#047857}`],
})
export class RescheduleDialogComponent implements OnInit {
  items: RescheduleProposal[] = []; dates: AvailableDateResponse[] = []; slots: SlotResponse[] = [];
  date = ''; slotId: number | null = null; reason = ''; expiresAt = '';
  loading = false; slotsLoading = false; busy = false; changed = false;
  error = ''; actionError = ''; availabilityError = ''; success = ''; confirming: number | null = null;
  private slotRequest = 0;
  labels: Record<string, string> = {PENDING:'Chờ phản hồi',ACCEPTED:'Đã chấp nhận',DECLINED:'Đã từ chối',WITHDRAWN:'Đã rút',EXPIRED:'Hết hạn',INVALIDATED:'Lịch cũ không còn phù hợp'};
  constructor(@Inject(MAT_DIALOG_DATA) public data: {appointment: AppointmentResponse; admin: boolean},
    private service: RescheduleService, private doctors: DoctorService,
    private ref: MatDialogRef<RescheduleDialogComponent>, private destroy: DestroyRef) {}
  ngOnInit(): void { this.load(); if (this.data.admin) this.loadDates(); }
  state(p: RescheduleProposal): string { return p.status === 'PENDING' && new Date(p.expiresAt + '+07:00').getTime() <= Date.now() ? 'EXPIRED' : p.status; }
  get hasPending(): boolean { return this.items.some(p => this.state(p) === 'PENDING'); }
  get canPropose(): boolean {
    const a = this.data.appointment;
    return this.data.admin && a.visit?.status !== 'WAITING' && a.visit?.status !== 'IN_PROGRESS' && !this.items.some(p => p.status === 'ACCEPTED') &&
      (a.status === 'CANCELED' || ((a.status === 'PENDING' || a.status === 'CONFIRMED') && new Date(a.startAt + '+07:00').getTime() > Date.now()));
  }
  load(): void {
    this.loading = true; this.error = '';
    this.service.history(this.data.appointment.id, this.data.admin).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: res => { this.items = res.data; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Không tải được lịch sử đổi giờ.'; },
    });
  }
  loadDates(): void {
    this.availabilityError = '';
    this.doctors.getAvailableDates(this.data.appointment.doctorId).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: res => this.dates = res.data,
      error: () => this.availabilityError = 'Không tải được ngày khám còn chỗ.',
    });
  }
  loadSlots(): void {
    const request = ++this.slotRequest; this.slotId = null; this.slots = []; this.availabilityError = ''; this.expiresAt = '';
    if (!this.date) { this.slotsLoading = false; return; }
    this.slotsLoading = true;
    this.doctors.getAvailableSlots(this.data.appointment.doctorId, this.date).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: res => { if (request === this.slotRequest) { this.slots = res.data; this.slotsLoading = false; } },
      error: () => { if (request === this.slotRequest) { this.slotsLoading = false; this.availabilityError = 'Không tải được giờ khám. Hãy chọn lại ngày.'; } },
    });
  }
  suggestDeadline(): void {
    const slot = this.slots.find(s => s.id === this.slotId); if (!slot) return;
    let limit = new Date(slot.startAt + '+07:00').getTime();
    if (this.data.appointment.status !== 'CANCELED') limit = Math.min(limit, new Date(this.data.appointment.startAt + '+07:00').getTime());
    const instant = Math.min(Date.now() + 86400000, limit - 60000);
    this.expiresAt = new Date(instant + 7 * 3600000).toISOString().slice(0,16);
  }
  propose(): void {
    if (this.busy || !this.slotId || !this.reason.trim() || !this.expiresAt) return;
    this.setBusy(true);
    this.service.propose(this.data.appointment.id, this.slotId, this.reason.trim(), this.expiresAt + ':00').pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => { this.changed = true; this.setBusy(false); this.reason = ''; this.success = 'Đã gửi đề xuất cho bệnh nhân.'; this.load(); },
      error: err => { this.setBusy(false); this.actionError = err?.error?.message ?? 'Gửi chưa thành công. Hãy tải lại lịch sử trước khi gửi lại.'; },
    });
  }
  respond(p: RescheduleProposal, action: 'accept' | 'decline' | 'withdraw'): void {
    if (this.busy) return; this.setBusy(true);
    this.service.respond(this.data.appointment.id, p.id, action).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: res => { this.changed = true; this.setBusy(false); this.confirming = null;
        this.success = action === 'accept' ? 'Đã tạo lịch mới #' + res.data.replacementAppointmentId + ', chờ bác sĩ xác nhận.' : 'Đã cập nhật đề xuất.'; this.load(); },
      error: err => { this.setBusy(false); this.actionError = err?.error?.message ?? 'Chưa xác định được kết quả. Hãy tải lại lịch sử trước khi thử lại.'; this.load(); },
    });
  }
  private setBusy(value: boolean): void { this.busy = value; this.ref.disableClose = value; this.actionError = ''; this.success = ''; }
  close(): void { this.ref.close(this.changed); }
}
