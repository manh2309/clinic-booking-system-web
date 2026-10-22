import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService, NotificationResponse } from '../../../../core/services/notification.service';
import { PatientNotificationsComponent } from './patient-notifications.component';

describe('Notifications', () => {
  let component: PatientNotificationsComponent;
  let service: jasmine.SpyObj<NotificationService>;
  const item: NotificationResponse = {id:1, appointmentId:2, type:'APPOINTMENT_COMPLETED', title:'Kết quả', message:'Thông báo', read:false, readAt:null, createdAt:'2030-01-01T10:00:00'};
  beforeEach(() => {
    service = jasmine.createSpyObj<NotificationService>('NotificationService', ['getMine', 'markRead'], {changed:new Subject<void>()});
    component = new PatientNotificationsComponent(service, {url:'/patient/notifications'} as Router);
  });
  it('keeps failed loads separate from empty data', () => {
    service.getMine.and.returnValue(throwError(() => new Error('offline'))); component.load();
    expect(component.error).not.toBe(''); expect(component.loading).toBeFalse();
  });
  it('does not mark items read locally when the request fails', () => {
    const notification = {...item}; service.markRead.and.returnValue(throwError(() => new Error('offline')));
    component.markRead(notification);
    expect(notification.read).toBeFalse(); expect(component.actionError).not.toBe('');
  });
  it('blocks duplicate read requests and updates the item from the response', () => {
    const notification = {...item}; const request = new Subject<any>(); service.markRead.and.returnValue(request);
    component.markRead(notification); component.markRead(notification);
    expect(service.markRead).toHaveBeenCalledOnceWith(1);
    request.next({data:{...notification, read:true}});
    expect(notification.read).toBeTrue(); expect(component.reading.size).toBe(0);
  });
  it('never sends doctor notifications to patient routes', () => {
    expect(component.destination(item)).toBe('/patient/medical-records');
    const doctor = new PatientNotificationsComponent(service, {url:'/doctor/notifications'} as Router);
    expect(doctor.destination(item)).toBe('/doctor/appointments');
  });
});
