import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { NotificationService } from './notification.service';
import { MedicalRecordService } from './medical-record.service';
import { environment } from '../../../environments/environment';

describe('Clinical HTTP contracts', () => {
  let http: HttpTestingController;
  beforeEach(() => { TestBed.configureTestingModule({imports:[HttpClientTestingModule]}); http = TestBed.inject(HttpTestingController); });
  afterEach(() => http.verify());
  it('completes through the atomic result endpoint', () => {
    const body = {diagnosis:'Kết quả kiểm thử'};
    TestBed.inject(AppointmentService).complete(7, body).subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/doctors/me/appointments/7/complete`);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual(body); req.flush({});
  });
  it('loads only the current patient record list with pagination', () => {
    TestBed.inject(MedicalRecordService).getMine(2, 10).subscribe();
    const req = http.expectOne(r => r.url === `${environment.apiBaseUrl}/patient/me/medical-records`);
    expect(req.request.params.get('page')).toBe('2'); req.flush({});
  });
  it('marks every owned unread notification through one request', () => {
    const service = TestBed.inject(NotificationService);
    const changed = jasmine.createSpy('changed'); service.changed.subscribe(changed);
    service.markAllRead().subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/notifications/me/read-all`);
    expect(req.request.method).toBe('PATCH');
    expect(changed).not.toHaveBeenCalled();
    req.flush({code:1000, data:12});
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it('marks a notification read through the owned endpoint', () => {
    TestBed.inject(NotificationService).markRead(8).subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/notifications/me/8/read`);
    expect(req.request.method).toBe('PATCH'); req.flush({});
  });
});
