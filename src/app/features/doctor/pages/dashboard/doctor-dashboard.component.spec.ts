import { of, throwError } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DoctorDashboardComponent } from './doctor-dashboard.component';

describe('Doctor dashboard totals', () => {
  let service: jasmine.SpyObj<AppointmentService>;
  let component: DoctorDashboardComponent;
  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getDoctorAppointments', 'getDoctorSummary']);
    service.getDoctorAppointments.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:5, totalElements:125, totalPages:25, last:false,
    }}));
    service.getDoctorSummary.and.returnValue(of({code:1000, message:'Success', data:{
      totalAppointments:125, pendingCount:60, confirmedCount:15, completedCount:50, openScheduleCount:2,
    }}));
    component = new DoctorDashboardComponent(service, jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']));
  });
  it('uses full totals even when the recent page is empty', () => {
    component.loadData();
    expect(service.getDoctorAppointments).toHaveBeenCalledOnceWith(0, 5);
    expect(component.totalAppointments).toBe(125);
    expect(component.pendingCount).toBe(60);
    expect(component.openScheduleCount).toBe(2);
  });
  it('keeps summary errors separate from a successfully loaded list', () => {
    service.getDoctorSummary.and.returnValue(throwError(() => new Error('offline')));
    component.loadData();
    expect(component.statsError).toBeTrue();
    expect(component.hasError).toBeFalse();
    expect(component.totalAppointments).toBe(125);
  });
  it('can still show statistics when the recent list fails', () => {
    service.getDoctorAppointments.and.returnValue(throwError(() => new Error('offline')));
    component.loadData();
    expect(component.hasError).toBeTrue();
    expect(component.statsError).toBeFalse();
    expect(component.confirmedCount).toBe(15);
  });
});
