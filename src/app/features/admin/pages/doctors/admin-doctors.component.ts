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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NgIf, NgFor } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { DoctorResponse, SpecialtyResponse, CreateDoctorRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTableModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
    NgIf, NgFor,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
  ],
  template: `
    <div>
      <app-page-header title="Quản lý bác sĩ" subtitle="Thêm và quản lý bác sĩ trong hệ thống"></app-page-header>

      <div class="doctors-layout">
        <!-- Add Doctor Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Thêm bác sĩ mới</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="doctorForm" (ngSubmit)="onCreate()" class="doctor-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Họ và tên</mat-label>
                <input matInput formControlName="fullName" placeholder="Bác sĩ Nguyễn Văn A" />
                <mat-error>Bắt buộc (≥4 ký tự)</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên đăng nhập</mat-label>
                <input matInput formControlName="username" placeholder="bsnguyenvana" />
                <mat-error>Bắt buộc (≥4 ký tự)</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
                <mat-error>Email không hợp lệ</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mật khẩu</mat-label>
                <input matInput type="password" formControlName="password" placeholder="≥8 ký tự" />
                <mat-error>≥8 ký tự</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Chuyên khoa</mat-label>
                <mat-select formControlName="specialtyId">
                  <mat-option *ngFor="let s of specialties" [value]="s.id">{{ s.name }}</mat-option>
                </mat-select>
                <mat-error>Chọn chuyên khoa</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bằng cấp / Học vị</mat-label>
                <input matInput formControlName="qualification" placeholder="VD: Tiến sĩ Y khoa" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Kinh nghiệm, chuyên môn..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Số điện thoại</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <button mat-flat-button color="primary" type="submit" class="create-btn" [disabled]="isCreating">
                <mat-spinner *ngIf="isCreating" diameter="18"></mat-spinner>
                <mat-icon *ngIf="!isCreating">person_add</mat-icon>
                {{ isCreating ? 'Đang thêm...' : 'Thêm bác sĩ' }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Doctors Table -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-card-title>Danh sách bác sĩ</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-loading *ngIf="isLoading" [diameter]="32"></app-loading>

            <app-empty-state
              *ngIf="!isLoading && doctors.length === 0"
              icon="medical_services"
              title="Chưa có bác sĩ nào"
            ></app-empty-state>

            <table mat-table [dataSource]="doctors" *ngIf="!isLoading && doctors.length > 0" class="doctors-table">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let d">{{ d.id }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Tên bác sĩ</th>
                <td mat-cell *matCellDef="let d">
                  <div class="doc-cell">
                    <div class="doc-avatar">{{ d.fullName[0] }}</div>
                    <div>
                      <div>{{ d.fullName }}</div>
                      <div class="doc-qual">{{ d.qualification }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="specialty">
                <th mat-header-cell *matHeaderCellDef>Chuyên khoa</th>
                <td mat-cell *matCellDef="let d">{{ d.specialtyName }}</td>
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
    .doctors-layout { display: grid; grid-template-columns: 360px 1fr; gap: 20px; align-items: start; }
    .form-card, .table-card { border-radius: 12px; }
    .doctor-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .create-btn { height: 44px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-top: 4px; }

    .table-card mat-card-content { padding: 0 !important; }
    .doctors-table { width: 100%; }

    .doc-cell { display: flex; align-items: center; gap: 10px; }
    .doc-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #e8f5e9; color: #2e7d32;
      display: flex; align-items: center; justify-content: center; font-weight: 700;
    }
    .doc-qual { font-size: 12px; color: #6b7280; }

    @media (max-width: 900px) { .doctors-layout { grid-template-columns: 1fr; } }
  `],
})
export class AdminDoctorsComponent implements OnInit {
  doctorForm!: FormGroup;
  doctors: DoctorResponse[] = [];
  specialties: SpecialtyResponse[] = [];
  isLoading = false;
  isCreating = false;
  displayedColumns = ['id', 'name', 'specialty'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private doctorService: DoctorService,
    private specialtyService: SpecialtyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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

    this.loadSpecialties();
    this.loadDoctors();
  }

  loadSpecialties(): void {
    this.specialtyService.getAll().subscribe({
      next: (r) => { this.specialties = r.data ?? []; },
    });
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.search({ size: 100 }).subscribe({
      next: (r) => { this.doctors = r.data?.content ?? []; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  onCreate(): void {
    if (this.doctorForm.invalid) { this.doctorForm.markAllAsTouched(); return; }
    this.isCreating = true;
    const request = this.doctorForm.value as CreateDoctorRequest;
    this.adminService.createDoctor(request).subscribe({
      next: () => {
        this.isCreating = false;
        this.doctorForm.reset();
        this.snackBar.open('Thêm bác sĩ thành công!', 'Đóng', { duration: 3000, panelClass: 'success-snackbar' });
        this.loadDoctors();
      },
      error: (err: { error?: { message?: string } }) => {
        this.isCreating = false;
        this.snackBar.open(err?.error?.message ?? 'Thêm thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }
}
