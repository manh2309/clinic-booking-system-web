import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SchedulePlanningService, Leave, leaveLabels, clinicInstant, clinicDate } from '../../../../core/services/schedule-planning.service';
@Component({ selector: 'app-doctor-leaves', standalone: true, imports: [CommonModule, FormsModule, MatButtonModule], template: `
 <h1>Đơn nghỉ</h1><p>Gửi trước giờ bắt đầu, theo mốc 30 phút. Các khung giờ trống trong khoảng nghỉ được tạm giữ khi chờ duyệt.</p>
 <form (ngSubmit)="submit()" #form="ngForm">
 <div class="date-group"><label>Từ ngày<input type="date" name="startDate" [ngModel]="startDate" (ngModelChange)="changeStartDate($event)" [min]="today" [disabled]="busy" required></label>
 <label>Giờ bắt đầu (24 giờ)<select name="startTime" [(ngModel)]="startTime" [disabled]="busy" required><option *ngFor="let time of times" [value]="time">{{time}}</option></select></label></div>
 <div class="date-group"><label>Đến ngày<input type="date" name="endDate" [(ngModel)]="endDate" [min]="startDate || today" [disabled]="busy" required></label>
 <label>Giờ kết thúc (24 giờ)<select name="endTime" [(ngModel)]="endTime" [disabled]="busy" required><option *ngFor="let time of times" [value]="time">{{time}}</option></select></label></div>
 <label>Lý do<textarea name="reason" [(ngModel)]="reason" [disabled]="busy" required maxlength="500" rows="3"></textarea></label>
 <button mat-flat-button color="primary" [disabled]="busy||form.invalid">{{busy?'Đang gửi...':'Gửi đơn nghỉ'}}</button></form>
 <p *ngIf="message" role="status">{{message}}</p><p *ngIf="error" role="alert">{{error}}</p>
 <button mat-button (click)="load()" [disabled]="busy||loading">Làm mới</button><p *ngIf="loading">Đang tải đơn nghỉ...</p>
 <p *ngIf="!loading&&!loadError&&!leaves.length">Chưa có đơn nghỉ.</p><p *ngIf="loadError" role="alert">{{loadError}}</p>
 <article *ngFor="let l of leaves"><strong>{{l.startAt|date:'dd/MM/yyyy HH:mm'}} – {{l.endAt|date:'dd/MM/yyyy HH:mm'}}</strong>
 <p>{{labels[l.status] || l.status}} · {{l.reason}}</p><p *ngIf="l.reviewReason">Phản hồi: {{l.reviewReason}}</p>
 <button mat-stroked-button *ngIf="l.status==='PENDING'" [disabled]="busy" (click)="withdraw(l)">Rút đơn</button></article>
 `, styles: [`:host{display:block;max-width:1000px}h1{font-size:24px}p{color:#64748b;overflow-wrap:anywhere}form,article{background:white;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:16px 0}form{display:grid;gap:16px;grid-template-columns:1fr 1fr}label{display:flex;flex-direction:column;gap:8px;min-width:0}label:has(textarea){grid-column:1/-1}input,select,textarea{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}button{justify-self:start}.date-group{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:12px}p[role=alert]{color:#b91c1c}@media(max-width:600px){form{grid-template-columns:1fr;padding:14px}.date-group{grid-template-columns:minmax(0,1fr) 120px}}`] })
export class DoctorLeavesComponent implements OnInit {
    leaves: Leave[] = [];
    labels = leaveLabels;
    startDate = '';
    endDate = '';
    startTime = '08:00';
    endTime = '12:00';
    today = clinicDate();
    times = Array.from({length:48}, (_,i)=>`${Math.floor(i/2).toString().padStart(2,'0')}:${i%2===0?'00':'30'}`);
    get startAt(){return this.startDate ? `${this.startDate}T${this.startTime}` : '';}
    get endAt(){return this.endDate ? `${this.endDate}T${this.endTime}` : '';}
    changeStartDate(value:string){this.startDate=value;if(!this.endDate)this.endDate=value;}
    reason = '';
    busy = false;
    loading = false;
    error = '';
    loadError = '';
    message = '';
    constructor(private service: SchedulePlanningService) { }
    ngOnInit() { this.load(); }
    load() { this.loading = true; this.loadError = ''; this.service.mine().subscribe({ next: r => { this.leaves = r.data; this.loading = false; }, error: () => { this.loadError = 'Không tải được đơn nghỉ.'; this.loading = false; } }); }
    submit() {
        if (this.busy) return;
        this.error = ''; this.message = '';
        const start = clinicInstant(this.startAt), end = clinicInstant(this.endAt);
        if (!Number.isFinite(start) || !Number.isFinite(end)) this.error = 'Chọn đủ ngày và giờ bắt đầu, kết thúc.';
        else if (end <= start) this.error = 'Thời gian kết thúc phải sau thời gian bắt đầu. 12:00 là buổi trưa, 00:00 là nửa đêm.';
        else if (start <= Date.now()) this.error = 'Thời gian bắt đầu nghỉ phải ở tương lai. Hãy kiểm tra lại ngày và giờ.';
        else if (!this.times.includes(this.startTime) || !this.times.includes(this.endTime)) this.error = 'Chọn giờ theo mốc 30 phút, ví dụ 08:00 hoặc 08:30.';
        else if (end-start > 31*86400000) this.error = 'Mỗi đơn nghỉ tối đa 31 ngày.';
        else if (!this.reason.trim()) this.error = 'Nhập lý do xin nghỉ.';
        if (this.error) return;
        this.busy = true;
        this.service.request({startAt:this.startAt+':00',endAt:this.endAt+':00',reason:this.reason.trim()}).subscribe({
            next:()=>{this.busy=false;this.startDate='';this.endDate='';this.reason='';this.message='Đã gửi đơn nghỉ, chờ quản trị duyệt.';this.load();},
            error:e=>{this.busy=false;this.error=e.error?.message??'Không gửi được đơn nghỉ.';}
        });
    }
    withdraw(l: Leave) { if (this.busy)
        return; this.busy = true; this.error = ''; this.service.withdraw(l.id).subscribe({ next: () => { this.busy = false; this.load(); }, error: e => { this.busy = false; this.error = e.error?.message ?? 'Không rút được đơn.'; } }); }
}
