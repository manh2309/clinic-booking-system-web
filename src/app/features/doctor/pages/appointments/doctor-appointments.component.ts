import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicalRecordResponse } from '../../../../core/services/medical-record.service';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { QueueBoardComponent } from '../../../../shared/components/queue-board/queue-board.component';
import { clinicInstant, clinicDateKey } from '../../../../core/utils/clinic-time';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentResponse, AppointmentStatus, UpdateAppointmentStatusRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StatusChipComponent, StatusType } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatPaginatorModule, MatSnackBarModule,
    NgIf, NgFor, DatePipe,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent, StatusChipComponent, QueueBoardComponent,
  ],
  template: `
    <div>
      <app-page-header title="Lịch hẹn" subtitle="Danh sách bệnh nhân đặt lịch khám"></app-page-header>

      <p *ngIf="doctorActive === false" role="status">Hồ sơ bác sĩ đã ngừng hoạt động. Bạn vẫn có thể xem lịch hẹn.</p>
      <p *ngIf="activityError" role="alert">Không thể kiểm tra trạng thái bác sĩ. Thao tác cập nhật đang tạm khóa.
        <button mat-button (click)="loadActivity()">Thử lại</button>
      </p>
      <app-queue-board [canWrite]="doctorActive === true" (complete)="openCompletion($event)" (changed)="load()"></app-queue-board>

      <mat-card *ngIf="recordTarget" #recordPanel id="record-panel" class="record-panel">
        <mat-card-content>
          <h2>{{ recordTarget.status === 'COMPLETED' ? 'Kết quả khám' : 'Ghi kết quả khám' }} · Lịch hẹn #{{ recordTarget.id }}</h2>
          <p>{{ recordTarget.patientFullName || ('Bệnh nhân #' + recordTarget.patientAccountId) }}</p>
          <app-loading *ngIf="recordLoading" message="Đang tải kết quả khám..."></app-loading>
          <p *ngIf="recordError" role="alert">{{ recordError }}</p>
          <ng-container *ngIf="recordView">
            <h3>Chẩn đoán</h3><p class="record-text">{{ recordView.diagnosis }}</p>
            <ng-container *ngIf="recordView.examinationNotes"><h3>Ghi nhận khi khám</h3><p class="record-text">{{ recordView.examinationNotes }}</p></ng-container>
            <ng-container *ngIf="recordView.treatmentAdvice"><h3>Hướng dẫn điều trị</h3><p class="record-text">{{ recordView.treatmentAdvice }}</p></ng-container>
          </ng-container>
          <form *ngIf="recordTarget.status !== 'COMPLETED'" [formGroup]="recordForm" (ngSubmit)="submitCompletion()">
            <p>Kết quả được lưu khi hoàn thành lịch hẹn. Hãy kiểm tra trước khi gửi.</p>
            <label>Chẩn đoán *<textarea formControlName="diagnosis" rows="3" maxlength="5000"></textarea></label>
            <p role="alert" *ngIf="recordForm.controls.diagnosis.touched && recordForm.controls.diagnosis.invalid">Nhập chẩn đoán, tối đa 5.000 ký tự.</p>
            <label>Ghi nhận khi khám<textarea formControlName="examinationNotes" rows="3" maxlength="5000"></textarea></label>
            <label>Hướng dẫn điều trị<textarea formControlName="treatmentAdvice" rows="3" maxlength="5000"></textarea></label>
            <button mat-flat-button color="primary" type="submit" [disabled]="recordForm.invalid || updatingIds.has(recordTarget.id)">Lưu kết quả và hoàn thành</button>
          </form>
          <button mat-button (click)="closeRecord()" [disabled]="updatingIds.has(recordTarget.id)">Đóng</button>
        </mat-card-content>
      </mat-card>
      <label class="status-filter">Trạng thái
        <select [ngModel]="statusFilter" (ngModelChange)="setStatusFilter($event)" [disabled]="isLoading">
          <option value="">Tất cả</option><option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option><option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELED">Đã hủy</option><option value="EXPIRED">Hết hạn</option><option value="NO_SHOW">Vắng mặt</option>
        </select>
      </label>
      <button mat-stroked-button (click)="refresh()" [disabled]="isLoading || updatingIds.size > 0">
        <mat-icon>refresh</mat-icon>Làm mới
      </button>
      <app-loading *ngIf="isLoading" message="Đang tải lịch hẹn..."></app-loading>

      <!-- ERROR STATE -->
      <div class="error-banner" *ngIf="!isLoading && hasError">
        <mat-icon class="err-icon">error_outline</mat-icon>
        <div class="err-text">
          <strong>Không thể tải danh sách lịch hẹn</strong>
          <p>{{ errorMessage }}</p>
        </div>
        <button mat-stroked-button color="warn" (click)="load()">
          <mat-icon>refresh</mat-icon>
          Thử lại
        </button>
      </div>

      <div *ngIf="!isLoading && !hasError">
        <app-empty-state
          *ngIf="appointments.length === 0"
          icon="event_busy"
          title="Chưa có lịch hẹn nào"
          message="Không có lịch hẹn phù hợp với bộ lọc hiện tại"
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
                    <div class="patient-name">{{ appt.patientFullName || ('Bệnh nhân #' + appt.patientAccountId) }}</div>
                    <div *ngIf="appt.patientPhone">{{ appt.patientPhone }}</div>
                    <div *ngIf="appt.statusReason">{{ appt.statusReason }}</div>
                    <div class="patient-time">{{ appt.startAt | date:'HH:mm' }} – {{ appt.endAt | date:'HH:mm' }}</div>
                  </div>
                </div>

                <!-- Status + Actions -->
                <div class="appt-actions">
                  <app-status-chip [status]="mapStatus(appt.status)"></app-status-chip>

                  <span class="action-hint" *ngIf="appt.status === 'CONFIRMED' && !canComplete(appt)">
                    {{appt.visit?.status === 'WAITING' ? 'Đã tiếp nhận, chờ bắt đầu khám' : 'Chờ tiếp nhận tại phòng khám'}}
                  </span>
                  <button mat-stroked-button *ngIf="doctorActive === true && canStart(appt)" [disabled]="updatingIds.size > 0 || !!queue?.board?.activeVisit" (click)="startVisit(appt)">Bắt đầu khám</button>
                  <button mat-flat-button color="primary" *ngIf="doctorActive === true && canComplete(appt)"
                    (click)="openCompletion(appt)" [disabled]="updatingIds.size > 0">
                    Ghi kết quả khám
                  </button>
                  <button mat-button *ngIf="appt.status === 'COMPLETED'" (click)="viewRecord(appt)">Xem kết quả</button>
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" *ngIf="doctorActive === true && (canConfirm(appt) || canMarkNoShow(appt))" [disabled]="updatingIds.has(appt.id)">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu>
                    <button mat-menu-item (click)="updateStatus(appt, 'CONFIRMED')"
                      *ngIf="canConfirm(appt)">
                      <mat-icon>check_circle</mat-icon>
                      Xác nhận
                    </button>
                    <button mat-menu-item (click)="updateStatus(appt, 'NO_SHOW')" *ngIf="canMarkNoShow(appt)">
                      <mat-icon>person_off</mat-icon>Vắng mặt
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
    .action-hint {font-size:12px;color:#64748b;max-width:240px;}
    .record-panel {margin-bottom:20px;} .record-panel h2 {font-size:18px;}
    .record-panel label {display:flex;flex-direction:column;gap:6px;margin:12px 0;}
    .record-panel textarea {width:100%;box-sizing:border-box;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit;resize:vertical;}
    .record-text {white-space:pre-wrap;overflow-wrap:anywhere;}
    @media(max-width:600px) { .appt-row {flex-wrap:wrap;} .appt-patient {min-width:0;overflow-wrap:anywhere;} .appt-actions {flex-wrap:wrap;width:100%;} }
    .status-filter { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:16px; }
    select { min-height:40px; padding:8px; border:1px solid #cbd5e1; border-radius:8px; background:white; }
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
export class DoctorAppointmentsComponent implements OnInit, OnDestroy {
  @ViewChild(QueueBoardComponent) queue?: QueueBoardComponent;
  @ViewChild('recordPanel', {read:ElementRef}) set recordPanel(panel: ElementRef<HTMLElement> | undefined) {
    panel?.nativeElement.scrollIntoView({behavior:'smooth',block:'start'});
  }
  private clock?: ReturnType<typeof setInterval>;
  now = Date.now();
  appointments: AppointmentResponse[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  statusFilter: AppointmentStatus | '' = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  doctorActive: boolean | null = null;
  activityError = false;
  updatingIds = new Set<number>();
  recordTarget: AppointmentResponse | null = null;
  recordView: MedicalRecordResponse | null = null;
  recordLoading = false;
  recordError = '';
  private recordRequest = 0;
  readonly recordForm = new FormGroup({
    diagnosis: new FormControl('', {nonNullable:true, validators:[Validators.required, Validators.maxLength(5000), Validators.pattern(/.*\S.*/s)]}),
    examinationNotes: new FormControl('', {nonNullable:true, validators:[Validators.maxLength(5000)]}),
    treatmentAdvice: new FormControl('', {nonNullable:true, validators:[Validators.maxLength(5000)]}),
  });

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.clock = setInterval(() => { this.now = Date.now(); }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clock !== undefined) clearInterval(this.clock);
    this.recordRequest++;
  }

  refresh(): void {
    if (this.isLoading || this.updatingIds.size) return;
    this.now = Date.now();
    this.load();
    this.loadActivity();
    this.queue?.load();
  }

  loadActivity(): void {
    this.doctorActive = null;
    this.activityError = false;
    this.doctorService.getMine().subscribe({
      next: res => { this.doctorActive = res.data.active === true; },
      error: () => { this.activityError = true; },
    });
  }

  load(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.appointmentService.getDoctorAppointments(this.currentPage, this.pageSize, this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.appointments = res.data?.content ?? [];
        this.totalElements = res.data?.totalElements ?? 0;
        this.isLoading = false;
        if (this.currentPage > 0 && this.currentPage * this.pageSize >= this.totalElements) {
          this.currentPage = Math.max(0, Math.ceil(this.totalElements / this.pageSize) - 1);
          this.load();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải lịch hẹn.';
      },
    });
  }

  setStatusFilter(status: AppointmentStatus | ''): void {
    this.statusFilter = status;
    this.currentPage = 0;
    this.load();
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  canAct(status: AppointmentStatus, appt?: AppointmentResponse): boolean {
    if (this.doctorActive !== true || (status !== 'PENDING' && status !== 'CONFIRMED')) return false;
    return !appt || this.canConfirm(appt) || this.canComplete(appt) || this.canStart(appt) || this.canMarkNoShow(appt);
  }

  mapStatus(s: string): StatusType {
    const m: Record<string, StatusType> = {
      PENDING: 'pending', CONFIRMED: 'confirmed', COMPLETED: 'completed', CANCELED: 'cancelled', EXPIRED: 'expired', NO_SHOW: 'no-show',
    };
    return m[s] ?? 'pending';
  }

  openCompletion(appt: AppointmentResponse): void {
    if (this.doctorActive !== true || !this.canComplete(appt) || this.updatingIds.size) return;
    this.closeRecord(); this.recordTarget = appt;
    this.recordForm.reset();
  }

  viewRecord(appt: AppointmentResponse): void {
    if (this.updatingIds.size) return;
    this.closeRecord(); this.recordTarget = appt; this.recordLoading = true;
    const request = this.recordRequest;
    this.appointmentService.getDoctorRecord(appt.id).subscribe({
      next: res => { if (request !== this.recordRequest) return; this.recordView = res.data; this.recordLoading = false; },
      error: err => { if (request !== this.recordRequest) return; this.recordLoading = false; this.recordError = err?.status === 404 ? 'Lịch hẹn này chưa có kết quả được lưu.' : 'Chưa tải được kết quả khám. Hãy đóng và thử lại.'; },
    });
  }

  closeRecord(): void {
    if (this.recordTarget && this.updatingIds.has(this.recordTarget.id)) return;
    this.recordRequest++; this.recordTarget = null; this.recordView = null; this.recordError = ''; this.recordLoading = false;
  }

  submitCompletion(): void {
    const appt = this.recordTarget;
    if (!appt || this.doctorActive !== true || !this.canComplete(appt) || this.updatingIds.has(appt.id)) return;
    if (this.recordForm.invalid) { this.recordForm.markAllAsTouched(); return; }
    this.updatingIds.add(appt.id); this.recordError = '';
    const values = this.recordForm.getRawValue();
    this.appointmentService.complete(appt.id, {...values, diagnosis:values.diagnosis.trim()}).subscribe({
      next: () => {
        this.updatingIds.delete(appt.id); this.closeRecord(); this.load(); this.queue?.load();
        this.snackBar.open('Đã lưu kết quả và hoàn thành lịch hẹn.', 'Đóng', {duration:3000});
      },
      error: err => { this.updatingIds.delete(appt.id); this.recordError = err?.error?.message ?? 'Chưa lưu được kết quả. Nội dung bạn nhập vẫn được giữ lại.'; },
    });
  }

  updateStatus(appt: AppointmentResponse, status: AppointmentStatus): void {
    if (status === 'COMPLETED') { this.openCompletion(appt); return; }
    if (!this.canAct(appt.status, appt) || this.updatingIds.has(appt.id)) return;
    if (status === 'CONFIRMED' && !this.canConfirm(appt)) return;
    if (status === 'NO_SHOW' && !this.canMarkNoShow(appt)) return;
    this.updatingIds.add(appt.id);
    this.appointmentService.updateStatus(appt.id, { status }).subscribe({
      next: (res) => {
        Object.assign(appt, res.data);
        this.load();
        this.updatingIds.delete(appt.id);
        this.snackBar.open('Cập nhật trạng thái thành công!', 'Đóng', { duration: 3000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.updatingIds.delete(appt.id);
        this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  canConfirm(appt: AppointmentResponse): boolean {
    return appt.status === 'PENDING' && new Date(appt.startAt).getTime() > this.now;
  }

  canComplete(appt: AppointmentResponse): boolean {
    return appt.status === 'CONFIRMED' && appt.visit?.status === 'IN_PROGRESS' && clinicInstant(appt.startAt) <= this.now;
  }

  canStart(a: AppointmentResponse): boolean {
    return a.status === 'CONFIRMED' && a.visit?.status === 'WAITING' && clinicInstant(a.startAt) <= this.now
      && clinicDateKey(clinicInstant(a.startAt)) === clinicDateKey(this.now);
  }
  startVisit(a: AppointmentResponse): void {
    if (this.doctorActive !== true || !this.canStart(a) || this.updatingIds.size) return;
    this.updatingIds.add(a.id);
    this.appointmentService.startVisit(a.id).subscribe({
      next: () => { this.updatingIds.delete(a.id); this.load(); this.queue?.load(); },
      error: err => { this.updatingIds.delete(a.id); this.snackBar.open(err?.error?.message ?? 'Chưa bắt đầu được lượt khám. Hãy làm mới để kiểm tra.', 'Đóng', {duration:5000}); this.load(); this.queue?.load(); },
    });
  }

  canMarkNoShow(appt: AppointmentResponse): boolean {
    return appt.status === 'CONFIRMED' && appt.visit?.status !== 'WAITING' && appt.visit?.status !== 'IN_PROGRESS' && new Date(appt.endAt).getTime() <= this.now;
  }
}
