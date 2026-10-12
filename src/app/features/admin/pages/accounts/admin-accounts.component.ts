import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgFor } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminAccountResponse } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatSnackBarModule,
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
        title="Quản lý tài khoản người dùng"
        subtitle="Danh sách người dùng và phân quyền trong hệ thống ClinicCare"
      ></app-page-header>

      <app-loading *ngIf="isLoading" message="Đang tải danh sách tài khoản..."></app-loading>

      <mat-card class="table-card" *ngIf="!isLoading">
        <mat-card-content>
          <app-empty-state
            *ngIf="accounts.length === 0"
            icon="manage_accounts"
            title="Chưa có tài khoản nào"
          ></app-empty-state>

          <table mat-table [dataSource]="accounts" class="accounts-table" *ngIf="accounts.length > 0">
            <!-- ID -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let acc">{{ acc.id }}</td>
            </ng-container>

            <!-- Username -->
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Tên đăng nhập</th>
              <td mat-cell *matCellDef="let acc">
                <div class="user-cell">
                  <div class="user-avatar">{{ acc.username[0].toUpperCase() }}</div>
                  <div>
                    <div class="user-name">{{ acc.username }}</div>
                    <div class="user-id">ID: {{ acc.id }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Email -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Địa chỉ Email</th>
              <td mat-cell *matCellDef="let acc">{{ acc.email }}</td>
            </ng-container>

            <!-- Role -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Vai trò</th>
              <td mat-cell *matCellDef="let acc">
                <span class="role-chip" [class]="getRoleClass(acc.roleName)">
                  {{ formatRole(acc.roleName) }}
                </span>
              </td>
            </ng-container>

            <!-- Status / Action Toggle -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Trạng thái</th>
              <td mat-cell *matCellDef="let acc">
                <div class="status-action-cell">
                  <mat-slide-toggle
                    [checked]="acc.isActive !== false"
                    (change)="toggleStatus(acc)"
                    color="primary"
                    matTooltip="Bật/Tắt hoạt động tài khoản"
                  >
                    <span class="status-label" [class.inactive]="acc.isActive === false">
                      {{ acc.isActive === false ? 'Bị khóa' : 'Hoạt động' }}
                    </span>
                  </mat-slide-toggle>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .table-card {
      border-radius: 20px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05) !important;
      overflow: hidden;
    }
    .table-card mat-card-content { padding: 0 !important; }

    .accounts-table { width: 100%; }

    .mat-mdc-header-cell {
      font-weight: 700;
      color: #0f172a;
      background: #f8fafc;
      font-size: 13px;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .mat-mdc-cell {
      font-size: 14px;
      color: #334155;
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
    }

    .user-name {
      font-weight: 700;
      color: #0f172a;
    }

    .user-id {
      font-size: 11px;
      color: #94a3b8;
    }

    .role-chip {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
    }

    .role-patient  { background: #e0f2fe; color: #0369a1; }
    .role-doctor   { background: #dcfce7; color: #15803d; }
    .role-admin    { background: #fee2e2; color: #b91c1c; }
    .role-default  { background: #f1f5f9; color: #475569; }

    .status-action-cell {
      display: flex;
      align-items: center;
    }

    .status-label {
      font-size: 13px;
      font-weight: 600;
      color: #16a34a;

      &.inactive {
        color: #ef4444;
      }
    }
  `],
})
export class AdminAccountsComponent implements OnInit {
  accounts: AdminAccountResponse[] = [];
  isLoading = false;
  displayedColumns = ['id', 'username', 'email', 'role', 'status'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.adminService.getAllAccounts().subscribe({
      next: (r) => {
        this.accounts = r.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  toggleStatus(acc: AdminAccountResponse): void {
    const newStatus = acc.isActive === false ? true : false;
    this.adminService.updateAccountStatus(acc.id, { isActive: newStatus }).subscribe({
      next: () => {
        acc.isActive = newStatus;
        this.snackBar.open(
          `Đã ${newStatus ? 'kích hoạt' : 'khóa'} tài khoản ${acc.username} thành công!`,
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

  formatRole(roleName: string): string {
    const map: Record<string, string> = {
      ROLE_PATIENT: 'Bệnh nhân',
      ROLE_DOCTOR:  'Bác sĩ',
      ROLE_ADMIN:   'Quản trị viên',
    };
    return map[roleName] ?? roleName;
  }

  getRoleClass(roleName: string): string {
    if (roleName?.includes('PATIENT')) return 'role-chip role-patient';
    if (roleName?.includes('DOCTOR'))  return 'role-chip role-doctor';
    if (roleName?.includes('ADMIN'))   return 'role-chip role-admin';
    return 'role-chip role-default';
  }
}
