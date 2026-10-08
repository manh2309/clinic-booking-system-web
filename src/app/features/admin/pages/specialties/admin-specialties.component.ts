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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { SpecialtyResponse, CreateSpecialtyRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    NgIf, NgFor,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
  ],
  template: `
    <div>
      <app-page-header title="Chuyên khoa" subtitle="Quản lý danh mục chuyên khoa y tế"></app-page-header>

      <div class="specialty-layout">
        <!-- Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{ editMode ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa mới' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="specialtyForm" (ngSubmit)="onSubmit()" class="specialty-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên chuyên khoa</mat-label>
                <input matInput formControlName="name" placeholder="VD: Tim mạch" />
                <mat-error>Bắt buộc nhập tên</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả</mat-label>
                <textarea matInput formControlName="description" rows="3"
                  placeholder="Mô tả về chuyên khoa này..."></textarea>
              </mat-form-field>

              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="isSaving">
                  <mat-spinner *ngIf="isSaving" diameter="18"></mat-spinner>
                  <mat-icon *ngIf="!isSaving">{{ editMode ? 'save' : 'add' }}</mat-icon>
                  {{ editMode ? 'Lưu thay đổi' : 'Thêm mới' }}
                </button>
                <button mat-stroked-button type="button" *ngIf="editMode" (click)="cancelEdit()">
                  Hủy
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Table -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Danh sách chuyên khoa</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-loading *ngIf="isLoading" [diameter]="32"></app-loading>

            <app-empty-state
              *ngIf="!isLoading && specialties.length === 0"
              icon="local_hospital"
              title="Chưa có chuyên khoa nào"
            ></app-empty-state>

            <table mat-table [dataSource]="specialties" *ngIf="!isLoading && specialties.length > 0" class="specialty-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let s">{{ s.id }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Tên chuyên khoa</th>
                <td mat-cell *matCellDef="let s">
                  <div class="spec-cell">
                    <div class="spec-icon"><mat-icon>local_hospital</mat-icon></div>
                    <div>
                      <div class="spec-name">{{ s.name }}</div>
                      <div class="spec-desc">{{ s.description }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Thao tác</th>
                <td mat-cell *matCellDef="let s">
                  <button mat-icon-button (click)="startEdit(s)" title="Sửa">
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
    .specialty-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
    .form-card, .table-card { border-radius: 12px; }

    .specialty-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }

    .form-actions { display: flex; gap: 10px; margin-top: 4px; }
    button[mat-flat-button] { height: 44px; font-weight: 600; display: flex; align-items: center; gap: 8px; }

    .table-card mat-card-content { padding: 0 !important; }
    .specialty-table { width: 100%; }

    .spec-cell { display: flex; align-items: center; gap: 12px; }
    .spec-icon {
      width: 40px; height: 40px; border-radius: 10px; background: #f3e5f5;
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #7b1fa2; }
    }
    .spec-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    .spec-desc { font-size: 12px; color: #6b7280; }

    @media (max-width: 900px) { .specialty-layout { grid-template-columns: 1fr; } }
  `],
})
export class AdminSpecialtiesComponent implements OnInit {
  specialtyForm!: FormGroup;
  specialties: SpecialtyResponse[] = [];
  editingId: number | null = null;
  editMode = false;
  isLoading = false;
  isSaving = false;
  displayedColumns = ['id', 'name', 'actions'];

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
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.specialtyService.getAll().subscribe({
      next: (r) => { this.specialties = r.data ?? []; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  startEdit(s: SpecialtyResponse): void {
    this.editMode = true;
    this.editingId = s.id;
    this.specialtyForm.patchValue({ name: s.name, description: s.description ?? '' });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editingId = null;
    this.specialtyForm.reset();
  }

  onSubmit(): void {
    if (this.specialtyForm.invalid) { this.specialtyForm.markAllAsTouched(); return; }
    this.isSaving = true;
    const request = this.specialtyForm.value as CreateSpecialtyRequest;

    const obs = this.editMode && this.editingId
      ? this.specialtyService.update(this.editingId, request)
      : this.specialtyService.create(request);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.cancelEdit();
        this.snackBar.open(
          this.editMode ? 'Cập nhật thành công!' : 'Thêm chuyên khoa thành công!',
          'Đóng', { duration: 3000, panelClass: 'success-snackbar' }
        );
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Thao tác thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }
}
