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
    <div class="fade-in">
      <app-page-header
        title="Quản lý Chuyên khoa khám bệnh"
        subtitle="Danh mục các chuyên khoa phục vụ công tác điều phối bệnh nhân"
      ></app-page-header>

      <div class="specialty-layout">
        <!-- FORM CARD -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{ editMode ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="specialtyForm" (ngSubmit)="onSubmit()" class="specialty-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên chuyên khoa</mat-label>
                <input matInput formControlName="name" placeholder="VD: Khoa Tim mạch" />
                <mat-icon matPrefix>local_hospital</mat-icon>
                <mat-error>Bắt buộc nhập tên chuyên khoa</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả chuyên khoa</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  rows="4"
                  placeholder="Mô tả chức năng, các chứng bệnh tiếp nhận điều trị..."
                ></textarea>
                <mat-icon matPrefix>notes</mat-icon>
              </mat-form-field>

              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="isSaving" class="btn-submit">
                  <mat-spinner *ngIf="isSaving" diameter="18" class="spinner-inline"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">{{ editMode ? 'save' : 'add_circle' }}</mat-icon>
                  <span>{{ editMode ? 'Lưu thay đổi' : 'Tạo chuyên khoa' }}</span>
                </button>
                <button mat-stroked-button type="button" *ngIf="editMode" (click)="cancelEdit()">
                  Hủy
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- TABLE CARD -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Danh mục chuyên khoa hiện có ({{ specialties.length }})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-loading *ngIf="isLoading" [diameter]="32"></app-loading>

            <app-empty-state
              *ngIf="!isLoading && specialties.length === 0"
              icon="local_hospital"
              title="Chưa có chuyên khoa nào"
            ></app-empty-state>

            <table
              mat-table
              [dataSource]="specialties"
              *ngIf="!isLoading && specialties.length > 0"
              class="specialty-table"
            >
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s">{{ s.id }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Tên chuyên khoa</th>
                <td mat-cell *matCellDef="let s">
                  <div class="spec-cell">
                    <div class="spec-icon">
                      <mat-icon>medical_services</mat-icon>
                    </div>
                    <div>
                      <div class="spec-name">{{ s.name }}</div>
                      <div class="spec-desc">{{ s.description || 'Chưa có mô tả' }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Status Toggle -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
                <td mat-cell *matCellDef="let s">
                  <mat-slide-toggle
                    [checked]="s.active !== false"
                    (change)="toggleStatus(s)"
                    color="primary"
                    matTooltip="Bật/Tắt hoạt động của chuyên khoa"
                  >
                    <span class="status-txt" [class.off]="s.active === false">
                      {{ s.active === false ? 'Tạm ẩn' : 'Hiển thị' }}
                    </span>
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Thao tác</th>
                <td mat-cell *matCellDef="let s">
                  <button mat-icon-button color="primary" (click)="startEdit(s)" title="Chỉnh sửa">
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
    .specialty-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
      align-items: start;
    }

    .form-card, .table-card {
      border-radius: 20px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
    }

    .specialty-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width { width: 100%; }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-submit {
      height: 44px;
      font-weight: 700;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .table-card mat-card-content { padding: 0 !important; }
    .specialty-table { width: 100%; }

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

    .spec-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .spec-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #e0f2fe;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon { color: #0284c7; font-size: 24px; width: 24px; height: 24px; }
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
      max-width: 380px;
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
      .specialty-layout { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminSpecialtiesComponent implements OnInit {
  specialtyForm!: FormGroup;
  specialties: SpecialtyResponse[] = [];
  editingId: number | null = null;
  editMode = false;
  isLoading = false;
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
    this.specialtyService.getAll().subscribe({
      next: (r) => {
        this.specialties = r.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  startEdit(specialty: SpecialtyResponse): void {
    this.editMode = true;
    this.editingId = specialty.id;
    this.specialtyForm.patchValue({
      name: specialty.name,
      description: specialty.description ?? '',
    });
  }

  cancelEdit(): void {
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
          this.cancelEdit();
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
          this.specialtyForm.reset();
          this.snackBar.open('Tạo chuyên khoa mới thành công!', 'Đóng', {
            duration: 3000,
            panelClass: 'success-snackbar',
          });
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
