import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatSlideToggleModule, MatSnackBarModule,
    NgIf, NgFor,
    PageHeaderComponent, LoadingComponent, EmptyStateComponent,
  ],
  template: `
    <div>
      <app-page-header title="Quản lý tài khoản" subtitle="Danh sách người dùng trong hệ thống"></app-page-header>

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
                  {{ acc.username }}
                </div>
              </td>
            </ng-container>

            <!-- Email -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
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

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .table-card { border-radius: 12px; }
    .table-card mat-card-content { padding: 0 !important; }

    .accounts-table { width: 100%; }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: #374151;
      background: #f9fafb;
      font-size: 13px;
    }

    .mat-mdc-cell { font-size: 14px; color: #374151; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #1565c0; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600;
    }

    .role-chip {
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
    }

    .role-patient  { background: #e3f2fd; color: #1565c0; }
    .role-doctor   { background: #e8f5e9; color: #2e7d32; }
    .role-admin    { background: #fce4ec; color: #b71c1c; }
    .role-default  { background: #f5f5f5; color: #616161; }
  `],
})
export class AdminAccountsComponent implements OnInit {
  accounts: AdminAccountResponse[] = [];
  isLoading = false;
  displayedColumns = ['id', 'username', 'email', 'role'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.adminService.getAllAccounts().subscribe({
      next: (r) => {
        this.accounts = r.data ?? [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  formatRole(roleName: string): string {
    const map: Record<string, string> = {
      ROLE_PATIENT: 'Bệnh nhân',
      ROLE_DOCTOR:  'Bác sĩ',
      ROLE_ADMIN:   'Admin',
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
