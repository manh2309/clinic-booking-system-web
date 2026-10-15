import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgIf, NgFor } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import {
  DoctorResponse,
  SpecialtyResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
} from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatPaginatorModule,
    NgIf,
    NgFor,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="fade-in admin-doctors-page">
      <!-- HEADER & TOP ACTION -->
      <div class="page-top-bar">
        <div>
          <h1 class="page-title">Quản lý Bác sĩ</h1>
          <p class="page-subtitle">Danh sách đội ngũ bác sĩ chuyên khoa và phân quyền tiếp nhận khám</p>
        </div>
        <button
          mat-flat-button
          color="primary"
          (click)="openAddForm()"
          *ngIf="!isFormOpen"
          class="btn-add-top"
        >
          <mat-icon>person_add</mat-icon>
          <span>Thêm bác sĩ</span>
        </button>
      </div>

      <!-- FORM PANEL (OPENS ON ADD / EDIT) -->
      <mat-card class="form-panel-card" *ngIf="isFormOpen">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <mat-icon class="panel-icon">{{ editMode ? 'edit' : 'person_add' }}</mat-icon>
            <h2 class="panel-title">
              {{ editMode ? 'Cập nhật thông tin bác sĩ' : 'Thêm bác sĩ mới vào hệ thống' }}
            </h2>
          </div>
          <button mat-icon-button (click)="cancelForm()" [disabled]="isSaving" title="Đóng">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <mat-card-content>
          <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()" class="doctor-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Họ và tên bác sĩ</mat-label>
                <input matInput formControlName="fullName" placeholder="VD: Bác sĩ Nguyễn Văn An" />
                <mat-icon matPrefix>badge</mat-icon>
                <mat-error>Bắt buộc (tối thiểu 4 ký tự)</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Chuyên khoa trực thuộc</mat-label>
                <mat-select formControlName="specialtyId">
                  <mat-option *ngFor="let s of specialties" [value]="s.id">{{ s.name }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>local_hospital</mat-icon>
                <mat-error>Vui lòng chọn chuyên khoa</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Bằng cấp / Học vị</mat-label>
                <input matInput formControlName="qualification" placeholder="VD: Thạc sĩ - BSCKI" />
                <mat-icon matPrefix>school</mat-icon>
              </mat-form-field>

              <!-- Fields only shown when creating new doctor -->
              <ng-container *ngIf="!editMode">
                <mat-form-field appearance="outline">
                  <mat-label>Tên đăng nhập</mat-label>
                  <input matInput formControlName="username" placeholder="VD: doctor_an" />
                  <mat-icon matPrefix>account_circle</mat-icon>
                  <mat-error>Bắt buộc (tối thiểu 4 ký tự)</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email liên hệ</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="doctor@clinic.vn" />
                  <mat-icon matPrefix>mail</mat-icon>
                  <mat-error>Email không hợp lệ</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Mật khẩu khởi tạo</mat-label>
                  <input matInput type="password" formControlName="password" placeholder="Tối thiểu 8 ký tự" />
                  <mat-icon matPrefix>lock</mat-icon>
                  <mat-error>Mật khẩu tối thiểu 8 ký tự</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Số điện thoại</mat-label>
                  <input matInput formControlName="phone" placeholder="VD: 0912345678" />
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
              </ng-container>

              <mat-form-field appearance="outline" class="col-span-full">
                <mat-label>Mô tả kinh nghiệm</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="2"
                  placeholder="Kinh nghiệm chuyên môn, thế mạnh khám chữa bệnh..."
                ></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-btn-row">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="btn-submit"
                [disabled]="isSaving"
              >
                <mat-spinner *ngIf="isSaving" diameter="18" class="spinner-inline"></mat-spinner>
                <mat-icon *ngIf="!isSaving">{{ editMode ? 'save' : 'check' }}</mat-icon>
                <span>{{ editMode ? 'Lưu thay đổi' : 'Thêm bác sĩ' }}</span>
              </button>

              <button
                mat-stroked-button
                type="button"
                (click)="cancelForm()"
                [disabled]="isSaving"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- DOCTORS TABLE (PRIMARY CONTENT) -->
      <mat-card class="table-card">
        <mat-card-content>
          <!-- Loading State -->
          <app-loading *ngIf="isLoading" message="Đang tải danh sách bác sĩ..."></app-loading>

          <!-- Error State -->
          <div class="error-banner" *ngIf="!isLoading && hasError">
            <mat-icon class="err-icon">error_outline</mat-icon>
            <div class="err-text">
              <strong>Không thể tải danh sách bác sĩ</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button mat-stroked-button color="warn" (click)="loadDoctors()">
              <mat-icon>refresh</mat-icon>
              Thử lại
            </button>
          </div>

          <!-- Empty State (Only when NOT loading and NO error) -->
          <app-empty-state
            *ngIf="!isLoading && !hasError && doctors.length === 0"
            icon="medical_services"
            title="Chưa có bác sĩ nào"
            message="Chưa có bác sĩ trong hệ thống. Bấm nút 'Thêm bác sĩ' để tạo mới."
          ></app-empty-state>

          <!-- Data Table -->
          <div class="table-responsive" *ngIf="!isLoading && !hasError && doctors.length > 0">
            <table mat-table [dataSource]="doctors" class="doctors-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="th-id">#</th>
                <td mat-cell *matCellDef="let d">{{ d.id }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Bác sĩ</th>
                <td mat-cell *matCellDef="let d">
                  <div class="doc-cell">
                    <div class="doc-avatar">{{ d.fullName ? d.fullName[0] : 'B' }}</div>
                    <div class="doc-meta">
                      <div class="doc-name">{{ d.fullName }}</div>
                      <div class="doc-qual">{{ d.qualification || 'Bác sĩ chuyên khoa' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="specialty">
                <th mat-header-cell *matHeaderCellDef>Chuyên khoa</th>
                <td mat-cell *matCellDef="let d">
                  <span class="specialty-badge">{{ d.specialtyName || 'Chưa phân khoa' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Nhận lịch khám</th>
                <td mat-cell *matCellDef="let d">
                  <mat-slide-toggle
                    [checked]="d.active !== false"
                    (change)="toggleDoctorStatus(d)"
                    color="primary"
                    matTooltip="Bật/Tắt trạng thái nhận lịch hẹn"
                  >
                    <span class="status-txt" [class.off]="d.active === false">
                      {{ d.active === false ? 'Tạm dừng' : 'Đang nhận' }}
                    </span>
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="th-actions">Thao tác</th>
                <td mat-cell *matCellDef="let d" class="td-actions">
                  <button mat-icon-button color="primary" (click)="startEdit(d)" title="Sửa thông tin">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Paginator -->
          <mat-paginator
            *ngIf="!isLoading && !hasError && totalDoctors > 0"
            [length]="totalDoctors"
            [pageSize]="pageSize"
            [pageIndex]="currentPage"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons
            class="doctors-paginator"
          ></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-doctors-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 4px 0 0;
    }

    .btn-add-top {
      height: 40px;
      padding: 0 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 13px;
    }

    /* FORM PANEL */
    .form-panel-card {
      border: 1px solid #bfdbfe !important;
      background: #f8fafc !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08) !important;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
    }

    .panel-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .panel-icon {
      color: #0284c7;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .form-panel-card mat-card-content {
      padding: 20px !important;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .col-span-full {
      grid-column: span 2;
    }

    .form-btn-row {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .btn-submit {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* TABLE */
    .table-card {
      border-radius: 14px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04) !important;
      background: #ffffff !important;
      overflow: hidden;
    }

    .table-card mat-card-content {
      padding: 0 !important;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .doctors-table {
      width: 100%;
      border-collapse: collapse;
    }

    .th-id { width: 50px; }
    .th-actions, .td-actions { width: 80px; text-align: center; }

    .mat-mdc-header-cell {
      font-weight: 700;
      color: #334155;
      background: #f8fafc;
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }

    .mat-mdc-cell {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }

    .doc-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doc-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .doc-name {
      font-weight: 700;
      color: #0f172a;
    }

    .doc-qual {
      font-size: 12px;
      color: #64748b;
      margin-top: 1px;
    }

    .specialty-badge {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-txt {
      font-size: 12px;
      font-weight: 600;
      color: #16a34a;

      &.off {
        color: #64748b;
      }
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      margin: 16px;
      color: #991b1b;

      .err-icon { color: #ef4444; font-size: 22px; width: 22px; height: 22px; }
      .err-text { flex: 1; p { margin: 2px 0 0; font-size: 12px; color: #b91c1c; } }
    }

    .spinner-inline {
      margin-right: 6px;
    }

    .doctors-paginator {
      margin-top: 14px;
      border-top: 1px solid #f1f5f9;
      background: transparent;
    }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .col-span-full { grid-column: span 1; }
      .page-top-bar { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AdminDoctorsComponent implements OnInit {
  doctorForm!: FormGroup;
  doctors: DoctorResponse[] = [];
  specialties: SpecialtyResponse[] = [];
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isSaving = false;
  isFormOpen = false;
  editMode = false;
  editingDoctorId: number | null = null;
  displayedColumns = ['id', 'name', 'specialty', 'status', 'actions'];

  // Pagination state
  currentPage = 0;
  pageSize = 20;
  totalDoctors = 0;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private doctorService: DoctorService,
    private specialtyService: SpecialtyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSpecialties();
    this.loadDoctors();
  }

  private initForm(): void {
    this.doctorForm = this.fb.group({
      fullName:      ['', [Validators.required, Validators.minLength(4)]],
      username:      ['', [Validators.required, Validators.minLength(4)]],
      email:         ['', [Validators.required, Validators.email]],
      password:      ['', [Validators.required, Validators.minLength(8)]],
      specialtyId:   [null, Validators.required],
      qualification: [''],
      description:   [''],
      phone:         [''],
    });
  }

  loadSpecialties(): void {
    this.specialtyService.getAll().subscribe({
      next: (r) => {
        this.specialties = r.data ?? [];
      },
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.doctorService.getAllForAdmin(this.currentPage, this.pageSize).subscribe({
      next: (r) => {
        this.doctors = r.data?.content ?? [];
        this.totalDoctors = r.data?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải danh sách bác sĩ.';
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDoctors();
  }

  openAddForm(): void {
    this.editMode = false;
    this.editingDoctorId = null;
    this.initForm();
    this.isFormOpen = true;
  }

  startEdit(doctor: DoctorResponse): void {
    this.editMode = true;
    this.editingDoctorId = doctor.id;
    this.isFormOpen = true;

    // Khi edit, bỏ qua validate cho username, email & password
    this.doctorForm.get('username')?.clearValidators();
    this.doctorForm.get('email')?.clearValidators();
    this.doctorForm.get('password')?.clearValidators();
    this.doctorForm.get('username')?.updateValueAndValidity();
    this.doctorForm.get('email')?.updateValueAndValidity();
    this.doctorForm.get('password')?.updateValueAndValidity();

    this.doctorForm.patchValue({
      fullName: doctor.fullName,
      specialtyId: doctor.specialtyId,
      qualification: doctor.qualification ?? '',
      description: doctor.description ?? '',
    });
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.editMode = false;
    this.editingDoctorId = null;
    this.initForm();
  }

  onSubmit(): void {
    if (this.editMode && this.editingDoctorId) {
      this.updateDoctor();
    } else {
      this.createDoctor();
    }
  }

  createDoctor(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const request = this.doctorForm.value as CreateDoctorRequest;
    this.adminService.createDoctor(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Thêm bác sĩ thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.currentPage = 0;
        this.cancelForm();
        this.loadDoctors();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Thêm bác sĩ thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  updateDoctor(): void {
    if (!this.editingDoctorId) return;
    const val = this.doctorForm.value;
    const request: UpdateDoctorRequest = {
      fullName: val.fullName,
      specialtyId: val.specialtyId,
      qualification: val.qualification,
      description: val.description,
    };
    this.isSaving = true;
    this.adminService.updateDoctor(this.editingDoctorId, request).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Cập nhật thông tin bác sĩ thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
        this.cancelForm();
        this.loadDoctors();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  toggleDoctorStatus(doctor: DoctorResponse): void {
    const newStatus = doctor.active === false ? true : false;
    this.adminService.updateDoctorStatus(doctor.id, { active: newStatus }).subscribe({
      next: () => {
        doctor.active = newStatus;
        this.snackBar.open(
          `Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} tiếp nhận khám cho bác sĩ ${doctor.fullName}!`,
          'Đóng',
          { duration: 3000, panelClass: 'success-snackbar' }
        );
      },
      error: (err: { error?: { message?: string } }) => {
        this.snackBar.open(err?.error?.message ?? 'Cập nhật trạng thái thất bại', 'Đóng', {
          duration: 3000,
        });
      },
    });
  }
}
