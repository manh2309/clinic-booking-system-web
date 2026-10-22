import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientProfileService } from '../../../../core/services/patient-profile.service';
import { PatientProfileComponent } from './patient-profile.component';
import { ApiResponse } from '../../../../core/models/api-response.model';

describe('Old patient profile completion', () => {
  let service: jasmine.SpyObj<PatientProfileService>;
  let component: PatientProfileComponent;
  beforeEach(() => {
    service = jasmine.createSpyObj<PatientProfileService>('PatientProfileService', ['getMyProfile', 'updateMyProfile']);
    service.getMyProfile.and.returnValue(of({code:1000, message:'Success', data:{accountId:1, email:'patient@test.com', phone:'0962964504'}}));
    component = new PatientProfileComponent(new FormBuilder(), service,
      jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']),
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
    component.ngOnInit();
  });
  it('keeps account contact data editable when there is no profile yet', () => {
    expect(component.hasError).toBeFalse();
    expect(component.profileForm.get('email')?.value).toBe('patient@test.com');
    expect(component.profileForm.get('fullName')?.value).toBe('');
  });
  it('sends null for empty optional values and prevents duplicate submissions', () => {
    service.updateMyProfile.and.returnValue(new Subject<ApiResponse<void>>());
    component.profileForm.patchValue({fullName:' Nguyen Van A '});
    component.onSubmit(); component.onSubmit();
    expect(service.updateMyProfile).toHaveBeenCalledTimes(1);
    expect(service.updateMyProfile.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      fullName:'Nguyen Van A', dateOfBirth:null, gender:null,
    }));
  });
});
