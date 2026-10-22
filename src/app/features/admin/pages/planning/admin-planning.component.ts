import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DoctorService } from '../../../../core/services/doctor.service';
import { DoctorResponse } from '../../../../core/models/domain.model';
import { SchedulePlanningService, WeeklyRule, Leave, Affected, leaveLabels, clinicDate } from '../../../../core/services/schedule-planning.service';
@Component({ selector: 'app-admin-planning', standalone: true, imports: [CommonModule, FormsModule, MatButtonModule], template: `
 <h1>Lịch tuần và duyệt nghỉ</h1><p>Lịch được tạo trước 30 ngày, mỗi lượt khám dự kiến 30 phút. Tối đa 8 giờ/ngày; chia sáng/chiều để chừa giờ nghỉ trưa.</p>
 <section><h2>Mẫu lịch tuần</h2>
 <p *ngIf="doctorError" role="alert">{{doctorError}} <button mat-button (click)="loadDoctors()">Thử lại</button></p>
 <label>Bác sĩ<select [ngModel]="doctorId" (ngModelChange)="selectDoctor($event)" [disabled]="busy||doctorsLoading"><option [ngValue]="null">Chọn bác sĩ</option><option *ngFor="let d of doctors" [ngValue]="d.id">#{{d.id}} · {{d.fullName}} · {{d.specialtyName}}</option></select></label>
 <div class="actions"><button mat-button [disabled]="doctorPage===0||busy||doctorsLoading" (click)="doctorPage=doctorPage-1;loadDoctors()">Trang bác sĩ trước</button><button mat-button [disabled]="doctorLast||busy||doctorsLoading" (click)="doctorPage=doctorPage+1;loadDoctors()">Trang bác sĩ sau</button></div>
 <form *ngIf="doctorId" (ngSubmit)="add()" #f="ngForm">
 <fieldset class="day-picker" [disabled]="busy"><legend>Ngày làm việc hằng tuần</legend>
 <div class="actions"><button type="button" mat-button (click)="selectedDays=[1,2,3,4,5]">Thứ hai–thứ sáu</button><button type="button" mat-button (click)="selectedDays=[1,2,3,4,5,6,7]">Cả tuần</button><button type="button" mat-button (click)="selectedDays=[]">Bỏ chọn</button></div>
 <div class="day-options"><label class="day-choice" *ngFor="let day of days;let i=index"><input type="checkbox" [name]="'day-'+i" [ngModel]="selectedDays.includes(i+1)" (ngModelChange)="toggleDay(i+1,$event)">{{day}}</label></div></fieldset>
 <fieldset class="window-picker" [disabled]="busy"><legend>Khoảng giờ trong ngày (24 giờ)</legend>
 <div class="time-row" *ngFor="let window of windows;let i=index"><label>Bắt đầu<select [name]="'start-'+i" [(ngModel)]="window.startTime" required><option *ngFor="let time of times" [value]="time">{{time}}</option></select></label>
 <label>Kết thúc<select [name]="'end-'+i" [(ngModel)]="window.endTime" required><option *ngFor="let time of times" [value]="time">{{time}}</option></select></label>
 <button type="button" mat-button [disabled]="windows.length===1" (click)="windows.splice(i,1)">Bỏ khoảng giờ {{i+1}}</button></div>
 <button type="button" mat-stroked-button [disabled]="windows.length>=8" (click)="windows.push({startTime:'13:00',endTime:'17:00'})">Thêm khoảng giờ</button>
 <p>Các khoảng giờ dùng chung cho những thứ đã chọn. Chừa khoảng nghỉ trưa; tổng không quá 8 giờ/ngày.</p></fieldset>
 <label>Hiệu lực từ<input name="from" type="date" [(ngModel)]="rule.effectiveFrom" [disabled]="busy" required></label><label>Đến hết ngày<input name="to" type="date" [(ngModel)]="rule.effectiveTo" [disabled]="busy" required></label>
 <p class="batch-preview">Áp dụng {{selectedDays.length}} ngày/tuần × {{windows.length}} khoảng giờ. Mẫu cùng thứ, giờ và ngày hiệu lực đã có sẽ được bỏ qua.</p>
 <div class="actions"><button mat-flat-button color="primary" [disabled]="busy||f.invalid||!selectedDays.length">{{busy?'Đang xử lý...':'Áp dụng lịch tuần'}}</button><button type="button" mat-stroked-button [disabled]="busy" (click)="generate()">Bù lịch còn thiếu</button></div></form>
 <p *ngIf="weeklyLoading">Đang tải mẫu lịch...</p><p *ngIf="weeklyError" role="alert">{{weeklyError}} <button mat-button (click)="loadWeekly()">Thử lại</button></p>
 <p *ngIf="doctorId&&!weeklyLoading&&!weeklyError&&!weekly.length">Chưa có mẫu lịch cho bác sĩ này.</p>
 <div class="table-wrap" *ngIf="weekly.length"><table><thead><tr><th>Thứ</th><th>Giờ</th><th>Hiệu lực</th><th>Trạng thái</th><th>Dừng mẫu</th></tr></thead><tbody><tr *ngFor="let w of weekly"><td>{{days[w.dayOfWeek-1]}}</td><td>{{w.startTime.slice(0,5)}}–{{w.endTime.slice(0,5)}}</td><td>{{w.effectiveFrom}} → {{w.effectiveTo}}</td><td>{{w.active?'Có hiệu lực theo ngày':'Đã dừng'}}</td><td><button mat-button *ngIf="w.active" [disabled]="busy||!endFrom" (click)="end(w)">Dừng từ ngày đã chọn</button></td></tr></tbody></table></div>
 <label *ngIf="weekly.length">Dừng từ ngày (sớm nhất ngày mai)<input type="date" [(ngModel)]="endFrom"></label><p *ngIf="weekly.length">Dừng mẫu đóng các ca được tạo từ mẫu sau ngày chọn. Nếu còn lịch hẹn, cần xử lý lịch hẹn trước; lịch cũ không bị xóa.</p>
 </section>
 <p *ngIf="error" role="alert">{{error}}</p><p *ngIf="message" role="status">{{message}}</p><ul *ngIf="conflicts.length"><li *ngFor="let c of conflicts">{{c}}</li></ul>
 <section><div class="actions"><h2>Đơn nghỉ bác sĩ</h2><button mat-button (click)="loadLeaves()" [disabled]="busy||leavesLoading">Làm mới</button></div><p *ngIf="leavesLoading">Đang tải đơn nghỉ...</p><p *ngIf="leavesError" role="alert">{{leavesError}}</p><p *ngIf="!leavesLoading&&!leavesError&&!leaves.length">Chưa có đơn nghỉ.</p>
 <label>Lọc trạng thái<select [(ngModel)]="statusFilter"><option value="">Tất cả</option><option *ngFor="let s of statuses" [value]="s">{{labels[s]}}</option></select></label>
 <article *ngFor="let l of filteredLeaves"><strong>{{l.doctorName}} (#{{l.doctorId}}) · {{labels[l.status]}}</strong><p>{{l.startAt|date:'dd/MM/yyyy HH:mm'}} – {{l.endAt|date:'dd/MM/yyyy HH:mm'}}</p><p>{{l.reason}}</p><p *ngIf="l.reviewReason">Phản hồi: {{l.reviewReason}}</p><button mat-stroked-button [disabled]="busy" (click)="inspect(l)">{{l.status==='PENDING'?'Xem ảnh hưởng và xử lý':'Xem lịch bị ảnh hưởng'}}</button></article>
 </section>
 <section *ngIf="selected"><h2>Đơn nghỉ #{{selected.id}}</h2><p *ngIf="affectedLoading">Đang kiểm tra lịch hẹn...</p><p *ngIf="affectedError" role="alert">{{affectedError}}</p>
 <div class="table-wrap" *ngIf="!affectedLoading&&!affectedError"><table *ngIf="affected.length"><thead><tr><th>Lịch hẹn</th><th>Tài khoản bệnh nhân</th><th>Điện thoại</th><th>Giờ khám</th><th>Liên hệ</th></tr></thead><tbody><tr *ngFor="let a of affected"><td>#{{a.appointmentId}}</td><td>{{a.patientName}}</td><td>{{a.patientPhone||'Chưa có số'}}</td><td>{{a.startAt|date:'dd/MM/yyyy HH:mm'}}</td><td><button mat-button *ngIf="a.contactId&&!a.contactedAt" [disabled]="busy" (click)="contact(a)">Đánh dấu đã liên hệ</button><span *ngIf="a.contactedAt">Đã liên hệ</span><span *ngIf="!a.contactId">Chưa hủy</span></td></tr></tbody></table><p *ngIf="!affected.length">Không có lịch hẹn bị ảnh hưởng.</p></div>
 <form *ngIf="selected.status==='PENDING'" (ngSubmit)="review('APPROVED')" #reviewForm="ngForm"><label>Lý do xử lý<textarea name="reviewReason" [(ngModel)]="reviewReason" required maxlength="500" rows="3"></textarea></label>
 <label class="check"><input type="checkbox" name="confirm" [(ngModel)]="confirmCancellation">Tôi xác nhận hủy các lịch hẹn bị ảnh hưởng nếu duyệt nghỉ và liên hệ bệnh nhân để đặt lại.</label>
 <p>Số lịch hẹn được kiểm tra lại khi duyệt. Không tự đổi bác sĩ hoặc giờ khám.</p><div class="actions"><button mat-flat-button color="primary" [disabled]="busy||affectedLoading||!!affectedError||reviewForm.invalid||(affected.length>0&&!confirmCancellation)">Duyệt nghỉ</button><button type="button" mat-stroked-button [disabled]="busy||reviewForm.invalid" (click)="review('REJECTED')">Từ chối</button></div></form>
 <button mat-button [disabled]="busy" (click)="selected=null">Đóng</button></section>
 `, styles: [`:host{display:block}h1{font-size:24px}h2{font-size:19px;margin:0 0 12px}p{color:#64748b;overflow-wrap:anywhere}section{background:#fff;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:20px 0}form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:20px 0}label{display:flex;flex-direction:column;gap:8px;min-width:0}select,input,textarea{box-sizing:border-box;max-width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit;background:white}textarea{width:100%}.actions,.check,form p,label:has(textarea),fieldset{grid-column:1/-1}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.check{flex-direction:row;align-items:flex-start}.check input{width:18px;height:18px;flex-shrink:0}article{border-top:1px solid #e2e8f0;padding:18px 0}.table-wrap{overflow:auto;max-width:100%}table{border-collapse:collapse;width:100%;min-width:650px}th,td{text-align:left;padding:12px;border-bottom:1px solid #e2e8f0}li{overflow-wrap:anywhere}fieldset{border:1px solid #e2e8f0;border-radius:10px;padding:16px;min-width:0}legend{font-weight:600;padding:0 6px}.day-options{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}.day-choice{flex-direction:row;align-items:center;gap:6px}.day-choice input{width:18px;height:18px}.time-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:12px;align-items:end;margin-bottom:12px}@media(max-width:700px){form{grid-template-columns:1fr}section{padding:14px}.time-row{grid-template-columns:1fr 1fr}.time-row button{grid-column:1/-1;justify-self:start}}`] })
export class AdminPlanningComponent implements OnInit {
    doctors: DoctorResponse[] = [];
    doctorId: number | null = null;
    doctorPage = 0;
    doctorLast = true;
    doctorsLoading = false;
    doctorError = '';
    weekly: WeeklyRule[] = [];
    weeklyLoading = false;
    weeklyError = '';
    leaves: Leave[] = [];
    leavesLoading = false;
    leavesError = '';
    statusFilter = 'PENDING';
    statuses = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
    labels = leaveLabels;
    selected: Leave | null = null;
    affected: Affected[] = [];
    affectedLoading = false;
    affectedError = '';
    reviewReason = '';
    confirmCancellation = false;
    busy = false;
    error = '';
    message = '';
    conflicts: string[] = [];
    endFrom = '';
    private weeklyRequest = 0;
    private affectedRequest = 0;
    days = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];
    selectedDays = [1,2,3,4,5];
    windows = [{startTime:'08:00',endTime:'12:00'},{startTime:'13:00',endTime:'17:00'}];
    times = Array.from({length:48},(_,i)=>`${Math.floor(i/2).toString().padStart(2,'0')}:${i%2===0?'00':'30'}`);
    rule = { effectiveFrom: clinicDate(), effectiveTo: new Date(Date.parse(clinicDate() + 'T00:00:00Z') + 90 * 86400000).toISOString().slice(0, 10) };
    constructor(private service: SchedulePlanningService, private doctorService: DoctorService) { }
    ngOnInit() { this.loadDoctors(); this.loadLeaves(); }
    get filteredLeaves() { return this.leaves.filter(l => !this.statusFilter || l.status === this.statusFilter); }
    loadDoctors() { this.doctorsLoading = true; this.doctorError = ''; this.doctorService.getAllForAdmin(this.doctorPage, 100).subscribe({ next: r => { this.doctors = r.data.content; this.doctorLast = r.data.last; this.doctorsLoading = false; }, error: () => { this.doctorError = 'Không tải được danh sách bác sĩ.'; this.doctorsLoading = false; } }); }
    selectDoctor(id: number | null) { this.doctorId = id; this.weekly = []; this.conflicts = []; this.message = ''; this.error = ''; this.loadWeekly(); }
    loadWeekly() { const request = ++this.weeklyRequest; if (!this.doctorId) {
        this.weeklyLoading = false;
        return;
    } this.weeklyLoading = true; this.weeklyError = ''; this.service.weekly(this.doctorId).subscribe({ next: r => { if (request !== this.weeklyRequest)
            return; this.weekly = r.data; this.weeklyLoading = false; }, error: () => { if (request !== this.weeklyRequest)
            return; this.weeklyError = 'Không tải được mẫu lịch.'; this.weeklyLoading = false; } }); }
    toggleDay(day:number,checked:boolean){this.selectedDays=checked?[...new Set([...this.selectedDays,day])].sort((a,b)=>a-b):this.selectedDays.filter(d=>d!==day);}
    add() {
        if (!this.doctorId || this.busy) return;
        this.error='';
        if(!this.selectedDays.length){this.error='Chọn ít nhất một ngày làm việc.';return;}
        const rows=[...this.windows].sort((a,b)=>a.startTime.localeCompare(b.startTime));
        let minutes=0;
        for(let i=0;i<rows.length;i++){
            const w=rows[i];
            if(!this.times.includes(w.startTime)||!this.times.includes(w.endTime)||w.endTime<=w.startTime){this.error='Giờ kết thúc phải sau giờ bắt đầu, theo mốc 30 phút.';return;}
            if(i>0&&rows[i-1].endTime>w.startTime){this.error='Các khoảng giờ trong ngày không được trùng nhau.';return;}
            const toMinutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3,5));
            minutes+=toMinutes(w.endTime)-toMinutes(w.startTime);
        }
        if(minutes>480){this.error='Tổng thời gian làm việc không được vượt 8 giờ/ngày.';return;}
        if(!this.rule.effectiveFrom||!this.rule.effectiveTo||this.rule.effectiveTo<this.rule.effectiveFrom){this.error='Kiểm tra ngày bắt đầu và kết thúc hiệu lực.';return;}
        this.begin();
        this.service.addWeeklyBatch(this.doctorId,{daysOfWeek:[...this.selectedDays],windows:rows.map(w=>({...w})),...this.rule}).subscribe({
            next:r=>{this.generated(r.data);this.message=`Đã thêm ${r.data.added} mẫu, bỏ qua ${r.data.skipped} mẫu giống hệt; tạo ${r.data.created} ca mới.`;},
            error:e=>this.fail(e)
        });
    }
    generate() { if (!this.doctorId || this.busy)
        return; this.begin(); this.service.generate(this.doctorId).subscribe({ next: r => this.generated(r.data), error: e => this.fail(e) }); }
    private generated(r: {
        created: number;
        conflicts: string[];
    }) { this.busy = false; this.message = `Đã tạo ${r.created} ca mới. Ca có sẵn được giữ nguyên.`; this.conflicts = r.conflicts; this.loadWeekly(); }
    end(w: WeeklyRule) { if (!this.doctorId || this.busy || !this.endFrom)
        return; this.begin(); this.service.endWeekly(this.doctorId, w.id, this.endFrom).subscribe({ next: () => { this.busy = false; this.message = 'Đã cập nhật ngày dừng mẫu.'; this.loadWeekly(); }, error: e => this.fail(e) }); }
    loadLeaves() { this.leavesLoading = true; this.leavesError = ''; this.service.all().subscribe({ next: r => { this.leaves = r.data; this.leavesLoading = false; }, error: () => { this.leavesError = 'Không tải được đơn nghỉ.'; this.leavesLoading = false; } }); }
    inspect(l: Leave) { if (this.busy)
        return; this.selected = l; this.reviewReason = ''; this.confirmCancellation = false; this.loadAffected(l.id); }
    private loadAffected(id: number) { const request = ++this.affectedRequest; this.affected = []; this.affectedLoading = true; this.affectedError = ''; this.service.affected(id).subscribe({ next: r => { if (request !== this.affectedRequest)
            return; this.affected = r.data; this.affectedLoading = false; }, error: () => { if (request !== this.affectedRequest)
            return; this.affectedError = 'Không tải được lịch hẹn bị ảnh hưởng.'; this.affectedLoading = false; } }); }
    review(decision: string) { if (!this.selected || this.busy || !this.reviewReason.trim())
        return; const id = this.selected.id; this.begin(); this.service.review(id, { decision, reason: this.reviewReason.trim(), confirmCancellation: this.confirmCancellation }).subscribe({ next: r => { this.busy = false; this.selected = r.data; this.message = 'Đã xử lý đơn nghỉ.'; this.statusFilter = r.data.status; this.loadLeaves(); this.loadAffected(id); }, error: e => { this.fail(e); this.loadAffected(id); } }); }
    contact(a: Affected) { if (!this.selected || !a.contactId || this.busy)
        return; const id = this.selected.id; this.begin(); this.service.contact(id, a.contactId).subscribe({ next: () => { this.busy = false; this.loadAffected(id); }, error: e => this.fail(e) }); }
    private begin() { this.busy = true; this.error = ''; this.message = ''; this.conflicts = []; }
    private fail(e: any) { this.busy = false; this.error = e.error?.message ?? 'Không thực hiện được thao tác. Hãy thử lại.'; }
}
