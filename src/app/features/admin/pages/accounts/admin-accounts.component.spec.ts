import { DirectoryService } from '../../../../core/services/directory.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { AdminService } from '../../../../core/services/admin.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { AdminAccountResponse } from '../../../../core/models/domain.model';
import { AdminAccountsComponent } from './admin-accounts.component';

describe('Admin account status toggle', () => {
  let fixture: ComponentFixture<AdminAccountsComponent>;
  let service: jasmine.SpyObj<AdminService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let response: Subject<ApiResponse<void>>;
  let account: AdminAccountResponse;

  beforeEach(async () => {
    account = { id: 1, username: 'admin', email: 'admin@example.invalid', roleName: 'ROLE_ADMIN', isActive: true };
    response = new Subject<ApiResponse<void>>();
    service = jasmine.createSpyObj<AdminService>('AdminService', ['getAllAccounts', 'updateAccountStatus']);
    service.getAllAccounts.and.returnValue(of({code: 1000, message: 'Success', data: [account]}));
    service.updateAccountStatus.and.returnValue(response);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    await TestBed.configureTestingModule({
      imports: [AdminAccountsComponent, NoopAnimationsModule],
      providers: [{provide:DirectoryService,useValue:{search:()=>of({data:{content:[account],totalElements:1}})}},{provide: AdminService, useValue: service}, {provide: MatSnackBar, useValue: snackBar}],
    }).overrideComponent(AdminAccountsComponent, {
      add: {providers: [{provide: MatSnackBar, useValue: snackBar}]},
    }).compileComponents();
    fixture = TestBed.createComponent(AdminAccountsComponent);
    fixture.detectChanges();
  });

  function toggle(): MatSlideToggle {
    return fixture.debugElement.query(By.directive(MatSlideToggle)).componentInstance;
  }

  function click(): void {
    fixture.debugElement.query(By.directive(MatSlideToggle)).nativeElement.querySelector('button').click();
    fixture.detectChanges();
  }

  it('keeps a rejected self-lock visibly active and displays the server error', () => {
    click();
    expect(toggle().checked).toBeTrue();
    expect(toggle().disabled).toBeTrue();
    response.error({error: {message: 'Không thể khóa tài khoản của chính mình'}});
    fixture.detectChanges();
    expect(toggle().checked).toBeTrue();
    expect(toggle().disabled).toBeFalse();
    expect(account.isActive).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Hoạt động');
    expect(snackBar.open).toHaveBeenCalledWith('Không thể khóa tài khoản của chính mình', 'Đóng', jasmine.any(Object));
  });

  it('keeps an inactive account visibly locked when activation fails', () => {
    account.isActive = false;
    fixture.detectChanges();
    click();
    response.error({status: 0});
    fixture.detectChanges();
    expect(toggle().checked).toBeFalse();
    expect(account.isActive).toBeFalse();
    expect(toggle().disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Bị khóa');
  });

  it('changes the switch and label only after a successful response', () => {
    click();
    expect(service.updateAccountStatus).toHaveBeenCalledOnceWith(1, {isActive: false});
    expect(account.isActive).toBeTrue();
    response.next({code: 1000, message: 'Success', data: undefined});
    response.complete();
    fixture.detectChanges();
    expect(toggle().checked).toBeFalse();
    expect(account.isActive).toBeFalse();
    expect(toggle().disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Bị khóa');
  });

  it('does not send another status update while the first request is pending', () => {
    click();
    click();
    expect(service.updateAccountStatus).toHaveBeenCalledTimes(1);
  });
});
