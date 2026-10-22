import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PatientAppointmentsComponent } from './patient-appointments.component';

describe('Patient appointment filters and cancellation', () => {
  let service: jasmine.SpyObj<AppointmentService>;
  let component: PatientAppointmentsComponent;

  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getMine']);
    service.getMine.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:10, totalElements:0, totalPages:0, last:true
    }}));
    component = new PatientAppointmentsComponent(service,
      jasmine.createSpyObj<MatDialog>('MatDialog', ['open']),
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']),
      jasmine.createSpyObj<Router>('Router', ['navigate']));
  });

  it('starts the filtered query at page zero instead of filtering the current page locally', () => {
    component.currentPage = 4;
    component.setStatusFilter('EXPIRED');
    expect(service.getMine).toHaveBeenCalledOnceWith(0, component.pageSize, 'EXPIRED');
  });

  it('does not allow patients to cancel an appointment that already started', () => {
    expect(component.canCancel({id:1, doctorId:2, status:'CONFIRMED',
      startAt:new Date(Date.now() - 60000).toISOString(), endAt:new Date(Date.now() + 60000).toISOString()})).toBeFalse();
  });

  it('shows expired and no-show appointments as closed states', () => {
    expect(component.mapStatus('EXPIRED')).toBe('expired');
    expect(component.mapStatus('NO_SHOW')).toBe('no-show');
  });
});
