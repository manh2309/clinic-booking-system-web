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
    NgIf,
    NgFor,
    PageHeaderComponent,
    LoadingComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="fade-in">
      <app-page-header
        title="Quản lý danh sách Bác sĩ"
        subtitle="Thêm mới, cập nhật chuyên môn và phân quyền công tác cho bác sĩ"
      ></app-page-header>

      <div class="doctors-layout">
        <!-- FORM CARD (CREATE OR EDIT) -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>
              {{ editMode ? 'Cập nhật thông tin bác sĩ' : 'Thêm bác sĩ mới vào hệ thống' }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()" class="doctor-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Họ và tên bác sĩ</mat-label>
                <input matInput formControlName="fullName" placeholder="VD: BSCKII. Trần Văn An" />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error>Bắt buộc (tối thiểu 4 ký tự)</mat-error>
              </mat-form-field>

              <!-- Only show username and password when creating -->
              <div *ngIf="!editMode" class="form-subgroup">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tên tài khoản đăng nhập</mat-label>
                  <input matInput formControlName="username" placeholder="bstranvanan" />
                  <mat-icon matPrefix>account_circle</mat-icon>
                  <mat-error>Bắt buộc (≥4 ký tự)</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email liên hệ</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="doctor@clinic.com" />
                  <mat-icon matPrefix>mail</mat-icon>
                  <mat-error>Email không hợp lệ</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mật khẩu khởi tạo</mat-label>
                  <input matInput type="password" formControlName="password" placeholder="≥8 ký tự" />
                  <mat-icon matPrefix>lock</mat-icon>
                  <mat-error>Mật khẩu ≥8 ký tự</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Số điện thoại</mat-label>
                  <input matInput formControlName="phone" placeholder="09xxxxxxxx" />
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Chuyên khoa trực thuộc</mat-label>
                <mat-select formControlName="specialtyId">
                  <mat-option *ngFor="let s of specialties" [value]="s.id">{{ s.name }}</mat-option>
                </mat-select>
                <mat-icon matPrefix>local_hospital</mat-icon>
                <mat-error>Vui lòng chọn chuyên khoa</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bằng cấp / Học vị</mat-label>
                <input matInput formControlName="qualification" placeholder="VD: Thạc sĩ - Bác sĩ CKI" />
                <mat-icon matPrefix>school</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả kinh nghiệm</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="3"
                  placeholder="Kinh nghiệm khám chữa bệnh, thế mạnh chuyên môn..."
                ></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>

              <div class="form-btn-row">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  class="btn-submit-doc"
                  [disabled]="isSaving"
                >
                  <mat-spinner *ngIf="isSaving" diameter="18" class="spinner-inline"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">{{ editMode ? 'save' : 'person_add' }}</mat-icon>
                  <span>{{ editMode ? 'Lưu thay đổi' : 'Thêm bác sĩ' }}</span>
                </button>

                <button
                  *ngIf="editMode"
                  mat-stroked-button
                  type="button"
                  (click)="cancelEdit()"
                  [disabled]="isSaving"
                >
                  Hủy
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- DOCTORS TABLE -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Danh sách Bác sĩ ({{ doctors.length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-loading *ngIf="isLoading" [diameter]="32"></app-loading>

            <app-empty-state
              *ngIf="!isLoading && doctors.length === 0"
              icon="medical_services"
              title="Chưa có bác sĩ nào"
            ></app-empty-state>

            <table
              mat-table
              [dataSource]="doctors"
              *ngIf="!isLoading && doctors.length > 0"
              class="doctors-table"
            >
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let d">{{ d.id }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Bác sĩ</th>
                <td mat-cell *matCellDef="let d">
                  <div class="doc-cell">
                    <div class="doc-avatar">{{ d.fullName[0] }}</div>
                    <div>
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
                <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
                <td mat-cell *matCellDef="let d">
                  <mat-slide-toggle
                    [checked]="d.active !== false"
                    (change)="toggleDoctorStatus(d)"
                    color="primary"
                    matTooltip="Bật/Tắt nhận lịch khám"
                  >
                    <span class="status-txt" [class.off]="d.active === false">
                      {{ d.active === false ? 'Tạm dừng' : 'Đang nhận khám' }}
                    </span>
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Thao tác</th>
                <td mat-cell *matCellDef="let d">
                  <button mat-icon-button color="primary" (click)="startEdit(d)" title="Sửa thông tin">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .doctors-layout {
      display: grid;
      grid-template-columns: 380px 1fr;
      gap: 24px;
      align-items: start;
    }

    .form-card, .table-card {
      border-radius: 20px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
    }

    .doctor-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width { width: 100%; }

    .form-subgroup {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-btn-row {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }

    .btn-submit-doc {
      height: 44px;
      font-weight: 700;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .table-card mat-card-content { padding: 0 !important; }
    .doctors-table { width: 100%; }

    .mat-mdc-header-cell {
      font-weight: 700;
      color: #0f172a;
      background: #f8fafc;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .mat-mdc-cell {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .doc-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doc-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }

    .doc-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 14px;
    }

    .doc-qual {
      font-size: 12px;
      color: #64748b;
    }

    .specialty-badge {
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-txt {
      font-size: 13px;
      font-weight: 600;
      color: #16a34a;

      &.off {
        color: #ef4444;
      }
    }

    .spinner-inline {
      margin-right: 6px;
    }

    @media (max-width: 992px) {
      .doctors-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminDoctorsComponent implements OnInit {
  doctorForm!: FormGroup;
  doctors: DoctorResponse[] = [];
  specialties: SpecialtyResponse[] = [];
  isLoading = false;
  isSaving = false;
  editMode = false;
  editingDoctorId: number | null = null;
  displayedColumns = ['id', 'name', 'specialty', 'status', 'actions'];

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
    this.doctorService.search({ size: 100 }).subscribe({
      next: (r) => {
        this.doctors = r.data?.content ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  startEdit(doctor: DoctorResponse): void {
    this.editMode = true;
    this.editingDoctorId = doctor.id;

    // Khi edit, bỏ qua validate cho username & password
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

  cancelEdit(): void {
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
        this.doctorForm.reset();
        this.snackBar.open('Thêm bác sĩ thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
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
        this.cancelEdit();
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
