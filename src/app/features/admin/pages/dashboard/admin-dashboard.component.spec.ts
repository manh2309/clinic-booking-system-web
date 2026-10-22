import { of, throwError } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AdminService } from '../../../../core/services/admin.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('Admin dashboard appointment count', () => {
  let component: AdminDashboardComponent;
  let appointments: jasmine.SpyObj<AppointmentService>;
  beforeEach(() => {
    appointments = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getAdminAppointments']);
    appointments.getAdminAppointments.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:1, totalElements:234, totalPages:234, last:false,
    }}));
    const accounts = jasmine.createSpyObj<AdminService>('AdminService', ['getAllAccounts']);
    const specialties = jasmine.createSpyObj<SpecialtyService>('SpecialtyService', ['getAllForAdmin']);
    const doctors = jasmine.createSpyObj<DoctorService>('DoctorService', ['getAllForAdmin']);
    accounts.getAllAccounts.and.returnValue(of({code:1000, message:'Success', data:[]}));
    specialties.getAllForAdmin.and.returnValue(of({code:1000, message:'Success', data:[]}));
    doctors.getAllForAdmin.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:1, totalElements:0, totalPages:0, last:true,
    }}));
    component = new AdminDashboardComponent(appointments, accounts, specialties, doctors);
  });
  it('uses totalElements rather than a hardcoded number or page length', () => {
    component.loadStats();
    expect(component.appointmentCount).toBe(234);
    expect(appointments.getAdminAppointments).toHaveBeenCalledOnceWith(0, 1);
  });
  it('does not display a failed count as zero', () => {
    appointments.getAdminAppointments.and.returnValue(throwError(() => new Error('offline')));
    component.loadStats();
    expect(component.appointmentError).toBeTrue();
    expect(component.appointmentCount).toBeNull();
  });
});
