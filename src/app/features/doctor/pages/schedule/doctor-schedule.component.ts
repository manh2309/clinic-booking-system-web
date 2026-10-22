import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { ScheduleResponse, SlotResponse } from '../../../../core/models/domain.model';
import { clinicInstant } from '../../../../core/services/schedule-planning.service';
@Component({ selector: 'app-doctor-schedule', standalone: true, imports: [CommonModule, FormsModule, RouterLink, MatButtonModule], template: `
 <div class="heading"><div><h1>Lịch làm việc</h1><p>Lịch được tạo từ mẫu tuần do phòng khám thiết lập. Mỗi khung giờ khám dự kiến 30 phút.</p></div>
 <a mat-flat-button color="primary" routerLink="/doctor/leaves">Gửi đơn nghỉ</a></div>
 <p *ngIf="unavailable" role="status">Bác sĩ hiện không nhận lịch mới. Lịch sử vẫn được giữ để tra cứu.</p>
 <div class="toolbar"><label>Hiển thị <select [(ngModel)]="filter"><option value="upcoming">Hôm nay và sắp tới</option><option value="history">Đã kết thúc</option><option value="all">Tất cả</option></select></label>
 <button mat-button (click)="loadSchedules()" [disabled]="loading">Làm mới</button></div>
 <p *ngIf="loading" role="status">Đang tải lịch làm việc...</p>
 <p *ngIf="error" role="alert">{{error}} <button mat-button (click)="loadSchedules()">Thử lại</button></p>
 <p *ngIf="!loading && !error && !visible.length">Chưa có ca phù hợp. Liên hệ quản trị nếu chưa có lịch tuần.</p>
 <article *ngFor="let s of visible"><div class="heading"><div><h2>{{s.startAt | date:'dd/MM/yyyy'}} · {{s.startAt | date:'HH:mm'}}–{{s.endAt | date:'HH:mm'}}</h2>
 <p>{{remaining(s)}} khung giờ còn nhận lịch</p></div><strong>{{scheduleLabel(s)}}</strong></div>
 <div class="slots"><span *ngFor="let slot of s.slots">{{slot.startAt | date:'HH:mm'}} · {{slotLabel(slot)}}</span></div></article>
 `, styles: [`
 :host{display:block}h1{font-size:24px;margin:0 0 8px}h2{font-size:17px;margin:0}p{color:#64748b}.heading,.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.toolbar{margin:20px 0}select{padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:white}article{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px}.slots{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.slots span{padding:6px 10px;background:#f1f5f9;border-radius:6px;font-size:13px}strong{color:#0f766e}@media(max-width:600px){article{padding:14px}.heading{align-items:flex-start}}
 `] })
export class DoctorScheduleComponent implements OnInit, OnDestroy {
    schedules: ScheduleResponse[] = [];
    loading = false;
    error = '';
    filter = 'upcoming';
    now = Date.now();
    private timer?: ReturnType<typeof setInterval>;
    constructor(private service: ScheduleService) { }
    ngOnInit() { this.loadSchedules(); this.timer = setInterval(() => this.now = Date.now(), 30000); }
    ngOnDestroy() { if (this.timer)
        clearInterval(this.timer); }
    loadSchedules() { this.loading = true; this.error = ''; this.service.getMySchedules().subscribe({ next: r => { this.schedules = r.data; this.loading = false; this.now = Date.now(); }, error: () => { this.loading = false; this.error = 'Không tải được lịch làm việc.'; } }); }
    get unavailable() { return this.schedules.some(s => s.doctorAvailable === false); }
    get visible() { return this.schedules.filter(s => this.filter === 'all' || (this.filter === 'history' ? clinicInstant(s.endAt) <= this.now : clinicInstant(s.endAt) > this.now)).sort((a, b) => this.filter === 'history' ? clinicInstant(b.startAt) - clinicInstant(a.startAt) : clinicInstant(a.startAt) - clinicInstant(b.startAt)); }
    scheduleLabel(s: ScheduleResponse) { return !s.active ? 'Đã hủy' : clinicInstant(s.endAt) <= this.now ? 'Đã kết thúc' : clinicInstant(s.startAt) <= this.now ? 'Đang diễn ra' : 'Sắp tới'; }
    slotLabel(s: SlotResponse) { return s.status === 'BOOKED' ? 'Đã đặt' : clinicInstant(s.startAt) <= this.now ? 'Đã qua giờ' : s.blockReason === 'PENDING_LEAVE' ? 'Chờ duyệt nghỉ' : s.blockReason === 'APPROVED_LEAVE' ? 'Bác sĩ nghỉ' : s.status === 'BLOCKED' ? 'Đã đóng' : 'Trống'; }
    remaining(s: ScheduleResponse) { return s.active && s.doctorAvailable !== false ? (s.slots ?? []).filter(x => x.status === 'AVAILABLE' && clinicInstant(x.startAt) > this.now).length : 0; }
}
