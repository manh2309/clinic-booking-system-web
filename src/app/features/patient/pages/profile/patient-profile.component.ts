import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import { PatientProfileService } from '../../../../core/services/patient-profile.service';
import { PatientProfileResponse, PatientProfileRequest } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule,
    NgIf,
    PageHeaderComponent, LoadingComponent,
  ],
  template: `
    <div>
      <app-page-header title="Hồ sơ cá nhân" subtitle="Cập nhật thông tin cá nhân của bạn"></app-page-header>

      <app-loading *ngIf="isLoading" message="Đang tải hồ sơ..."></app-loading>

      <div class="profile-layout" *ngIf="!isLoading">
        <!-- Avatar Card -->
        <mat-card class="avatar-card">
          <mat-card-content>
            <div class="avatar-section">
              <div class="avatar-circle">
                <span>{{ getInitials() }}</span>
              </div>
              <h3>{{ profile?.fullName || currentUser?.username }}</h3>
              <p class="email">{{ profile?.email || currentUser?.email }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Edit Form Card -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Thông tin cá nhân</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Họ và tên</mat-label>
                  <input matInput formControlName="fullName" placeholder="Nguyễn Văn A" />
                  <mat-icon matSuffix>badge</mat-icon>
                  <mat-error *ngIf="profileForm.get('fullName')?.hasError('required')">
                    Vui lòng nhập họ tên
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                  <mat-icon matSuffix>email</mat-icon>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                    Vui lòng nhập email
                  </mat-error>
                  <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                    Email không hợp lệ
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Số điện thoại</mat-label>
                  <input matInput formControlName="phone" placeholder="0912345678" />
                  <mat-icon matSuffix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ngày sinh</mat-label>
                  <input matInput type="date" formControlName="dateOfBirth" />
                  <mat-icon matSuffix>cake</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Giới tính</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="MALE">Nam</mat-option>
                    <mat-option value="FEMALE">Nữ</mat-option>
                    <mat-option value="OTHER">Khác</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Địa chỉ</mat-label>
                  <input matInput formControlName="address" placeholder="Số nhà, đường, quận, tỉnh" />
                  <mat-icon matSuffix>location_on</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-actions">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  [disabled]="isSaving || profileForm.invalid"
                >
                  <mat-spinner *ngIf="isSaving" diameter="18"></mat-spinner>
                  <span *ngIf="!isSaving">
                    <mat-icon>save</mat-icon>
                    Lưu thay đổi
                  </span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 20px;
      align-items: start;
    }

    .avatar-card, .form-card { border-radius: 12px; }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
      gap: 8px;
      text-align: center;
    }

    .avatar-circle {
      width: 96px;
      height: 96px;
      background: linear-gradient(135deg, #1565c0, #00897b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }

    .avatar-section h3 { font-size: 16px; font-weight: 600; margin: 0; color: #1a1a2e; }
    .email { font-size: 13px; color: #6b7280; margin: 0; }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    button[mat-flat-button] {
      height: 44px;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .profile-layout { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profile: PatientProfileResponse | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private profileService: PatientProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  get currentUser() { return this.authService.getCurrentUser(); }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(4)]],
      email:       ['', [Validators.required, Validators.email]],
      phone:       [''],
      dateOfBirth: [''],
      gender:      [''],
      address:     [''],
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getMyProfile().subscribe({
      next: (res) => {
        this.profile = res.data;
        if (this.profile) {
          this.profileForm.patchValue({
            fullName:    this.profile.fullName ?? '',
            email:       this.profile.email ?? '',
            phone:       this.profile.phone ?? '',
            dateOfBirth: this.profile.dateOfBirth ?? '',
            gender:      this.profile.gender ?? '',
            address:     this.profile.address ?? '',
          });
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const request: PatientProfileRequest = this.profileForm.value as PatientProfileRequest;
    this.profileService.updateMyProfile(request).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Cập nhật hồ sơ thành công!', 'Đóng', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving = false;
        this.snackBar.open(err?.error?.message ?? 'Cập nhật thất bại', 'Đóng', { duration: 3000 });
      },
    });
  }

  getInitials(): string {
    const name = this.profile?.fullName || this.currentUser?.username || 'U';
    return name.split(' ').map((p: string) => p[0]).slice(-2).join('').toUpperCase();
  }
}
