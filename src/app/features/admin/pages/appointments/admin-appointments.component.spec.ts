import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AppointmentResponse } from '../../../../core/models/domain.model';
import { AdminAppointmentsComponent } from './admin-appointments.component';

describe('Admin appointment resolution', () => {
  let service: jasmine.SpyObj<AppointmentService>;
  let component: AdminAppointmentsComponent;
  const appointment: AppointmentResponse = {id:12, doctorId:3, status:'PENDING',
    startAt:'2035-10-15T09:00:00', endAt:'2035-10-15T09:30:00'};

  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getAdminAppointments', 'resolveByAdmin']);
    service.getAdminAppointments.and.returnValue(of({code:1000,message:'Success',data:{
      content:[],page:0,size:20,totalElements:0,totalPages:0,last:true
    }}));
    component = new AdminAppointmentsComponent(service, jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
  });

  it('requires a reason before resolving an appointment', () => {
    component.open(appointment, 'cancel');
    component.reason = '   ';
    component.submit();
    expect(service.resolveByAdmin).not.toHaveBeenCalled();
  });

  it('sends the selected appointment and trimmed reason and reloads after success', () => {
    service.resolveByAdmin.and.returnValue(of({code:1000,message:'Success',data:{...appointment,status:'CANCELED'}}));
    component.open(appointment, 'cancel');
    component.reason = '  Bác sĩ ngừng công tác  ';
    component.submit();
    expect(service.resolveByAdmin).toHaveBeenCalledOnceWith(12, 'cancel', 'Bác sĩ ngừng công tác');
    expect(service.getAdminAppointments).toHaveBeenCalled();
    expect(component.selected).toBeNull();
  });

  it('does not offer no-show before the appointment ends', () => {
    expect(component.canNoShow({...appointment,status:'CONFIRMED',
      startAt:new Date(Date.now() + 60000).toISOString(),endAt:new Date(Date.now() + 1800000).toISOString()})).toBeFalse();
  });
});
