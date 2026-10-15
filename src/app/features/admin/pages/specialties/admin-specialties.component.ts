import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgFor } from '@angular/common';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { SpecialtyResponse, CreateSpecialtyRequest, UpdateSpecialtyRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
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
    <div class="fade-in admin-specialties-page">
      <!-- HEADER & TOP ACTION -->
      <div class="page-top-bar">
        <div>
          <h1 class="page-title">Quản lý Chuyên khoa</h1>
          <p class="page-subtitle">Danh mục các chuyên khoa y tế phục vụ công tác điều phối và đặt khám</p>
        </div>
        <button
          mat-flat-button
          color="primary"
          (click)="openAddForm()"
          *ngIf="!isFormOpen"
          class="btn-add-top"
        >
          <mat-icon>add_circle</mat-icon>
          <span>Thêm chuyên khoa</span>
        </button>
      </div>

      <!-- FORM PANEL (OPENS ON ADD / EDIT) -->
      <mat-card class="form-panel-card" *ngIf="isFormOpen">
        <div class="panel-header">
          <div class="panel-title-wrap">
            <mat-icon class="panel-icon">{{ editMode ? 'edit' : 'add_circle' }}</mat-icon>
            <h2 class="panel-title">
              {{ editMode ? 'Cập nhật thông tin chuyên khoa' : 'Thêm chuyên khoa mới' }}
            </h2>
          </div>
          <button mat-icon-button (click)="cancelForm()" [disabled]="isSaving" title="Đóng">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <mat-card-content>
          <form [formGroup]="specialtyForm" (ngSubmit)="onSubmit()" class="specialty-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tên chuyên khoa</mat-label>
              <input matInput formControlName="name" placeholder="VD: Khoa Tim mạch" />
              <mat-icon matPrefix>local_hospital</mat-icon>
              <mat-error>Bắt buộc nhập tên chuyên khoa</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mô tả chuyên môn</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="3"
                placeholder="Mô tả chức năng điều trị, phạm vi tiếp nhận bệnh nhân..."
              ></textarea>
              <mat-icon matPrefix>notes</mat-icon>
            </mat-form-field>

            <div class="form-btn-row">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="isSaving"
                class="btn-submit"
              >
                <mat-spinner *ngIf="isSaving" diameter="18" class="spinner-inline"></mat-spinner>
                <mat-icon *ngIf="!isSaving">{{ editMode ? 'save' : 'check' }}</mat-icon>
                <span>{{ editMode ? 'Lưu thay đổi' : 'Tạo chuyên khoa' }}</span>
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

      <!-- TABLE CARD (PRIMARY CONTENT) -->
      <mat-card class="table-card">
        <mat-card-content>
          <!-- Loading State -->
          <app-loading *ngIf="isLoading" message="Đang tải danh mục chuyên khoa..."></app-loading>

          <!-- Error State -->
          <div class="error-banner" *ngIf="!isLoading && hasError">
            <mat-icon class="err-icon">error_outline</mat-icon>
            <div class="err-text">
              <strong>Không thể tải danh sách chuyên khoa</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button mat-stroked-button color="warn" (click)="loadSpecialties()">
              <mat-icon>refresh</mat-icon>
              Thử lại
            </button>
          </div>

          <!-- Empty State -->
          <app-empty-state
            *ngIf="!isLoading && !hasError && specialties.length === 0"
            icon="local_hospital"
            title="Chưa có chuyên khoa nào"
            message="Bấm nút 'Thêm chuyên khoa' để khởi tạo danh mục đầu tiên."
          ></app-empty-state>

          <!-- Table -->
          <div class="table-responsive" *ngIf="!isLoading && !hasError && specialties.length > 0">
            <table mat-table [dataSource]="specialties" class="specialty-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="th-id">#</th>
                <td mat-cell *matCellDef="let s">{{ s.id }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Tên chuyên khoa</th>
                <td mat-cell *matCellDef="let s">
                  <div class="spec-cell">
                    <div class="spec-icon">
                      <mat-icon>medical_services</mat-icon>
                    </div>
                    <div class="spec-info">
                      <div class="spec-name">{{ s.name }}</div>
                      <div class="spec-desc">{{ s.description || 'Chưa có thông tin mô tả' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Toggle -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Trạng thái hiển thị</th>
                <td mat-cell *matCellDef="let s">
                  <mat-slide-toggle
                    [checked]="s.active !== false"
                    (change)="toggleStatus(s)"
                    color="primary"
                    matTooltip="Bật/Tắt hiển thị cho bệnh nhân"
                  >
                    <span class="status-txt" [class.off]="s.active === false">
                      {{ s.active === false ? 'Tạm ẩn' : 'Hiển thị' }}
                    </span>
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="th-actions">Thao tác</th>
                <td mat-cell *matCellDef="let s" class="td-actions">
                  <button mat-icon-button color="primary" (click)="startEdit(s)" title="Chỉnh sửa">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let r; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-specialties-page {
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

    .specialty-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width { width: 100%; }

    .form-btn-row {
      display: flex;
      gap: 10px;
      margin-top: 4px;
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

    .specialty-table {
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

    .spec-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .spec-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #e0f2fe;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon { color: #0284c7; font-size: 20px; width: 20px; height: 20px; }
    }

    .spec-info {
      display: flex;
      flex-direction: column;
    }

    .spec-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .spec-desc {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
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

    @media (max-width: 768px) {
      .page-top-bar { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AdminSpecialtiesComponent implements OnInit {
  specialtyForm!: FormGroup;
  specialties: SpecialtyResponse[] = [];
  editingId: number | null = null;
  editMode = false;
  isFormOpen = false;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isSaving = false;
  displayedColumns = ['id', 'name', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private specialtyService: SpecialtyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.specialtyForm = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
    });

    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.specialtyService.getAllForAdmin().subscribe({
      next: (r) => {
        this.specialties = r.data ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = err?.error?.message ?? 'Không thể kết nối đến máy chủ để tải danh mục chuyên khoa.';
      },
    });
  }

  openAddForm(): void {
    this.editMode = false;
    this.editingId = null;
    this.specialtyForm.reset();
    this.isFormOpen = true;
  }

  startEdit(specialty: SpecialtyResponse): void {
    this.editMode = true;
    this.editingId = specialty.id;
    this.specialtyForm.patchValue({
      name: specialty.name,
      description: specialty.description ?? '',
    });
    this.isFormOpen = true;
  }

  cancelForm(): void {
    this.isFormOpen = false;
    this.editMode = false;
    this.editingId = null;
    this.specialtyForm.reset();
  }

  onSubmit(): void {
    if (this.specialtyForm.invalid) {
      this.specialtyForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;

    if (this.editMode && this.editingId) {
      const req: UpdateSpecialtyRequest = this.specialtyForm.value;
      this.specialtyService.update(this.editingId, req).subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Cập nhật chuyên khoa thành công!', 'Đóng', {
            duration: 3000,
            panelClass: 'success-snackbar',
          });
          this.cancelForm();
          this.loadSpecialties();
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving = false;
          this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại', 'Đóng', { duration: 3000 });
        },
      });
    } else {
      const req: CreateSpecialtyRequest = this.specialtyForm.value;
      this.specialtyService.create(req).subscribe({
        next: () => {
          this.isSaving = false;
          this.snackBar.open('Tạo chuyên khoa mới thành công!', 'Đóng', {
            duration: 3000,
            panelClass: 'success-snackbar',
          });
          this.cancelForm();
          this.loadSpecialties();
        },
        error: (err: { error?: { message?: string } }) => {
          this.isSaving = false;
          this.snackBar.open(err?.error?.message ?? 'Tạo thất bại', 'Đóng', { duration: 3000 });
        },
      });
    }
  }

  toggleStatus(specialty: SpecialtyResponse): void {
    const newStatus = specialty.active === false ? true : false;
    this.specialtyService.updateStatus(specialty.id, { active: newStatus }).subscribe({
      next: () => {
        specialty.active = newStatus;
        this.snackBar.open(
          `Đã ${newStatus ? 'hiển thị' : 'tạm ẩn'} chuyên khoa ${specialty.name}!`,
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
