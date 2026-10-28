import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RescheduleDialogComponent } from './reschedule-dialog.component';
import { environment } from '../../../../environments/environment';

describe('Reschedule dialogue', () => {
  const a = {id:7,doctorId:2,status:'CONFIRMED',startAt:'2099-05-01T09:00:00',endAt:'2099-05-01T09:30:00'};
  const proposal = {id:3,appointmentId:7,targetSlotId:8,targetStartAt:'2099-05-02T09:00:00',targetEndAt:'2099-05-02T09:30:00',reason:'Đổi giờ',status:'PENDING',expiresAt:'2099-04-30T09:00:00',proposedBy:1,createdAt:'2099-04-29T09:00:00'};
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({imports:[RescheduleDialogComponent,NoopAnimationsModule], providers:[
      provideHttpClient(),provideHttpClientTesting(),{provide:MAT_DIALOG_DATA,useValue:{appointment:a,admin:false}},
      {provide:MatDialogRef,useValue:{disableClose:false,close:jasmine.createSpy('close')}}]});
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('requires explicit acceptance and sends only one request while saving', () => {
    const f = TestBed.createComponent(RescheduleDialogComponent); f.detectChanges();
    const url = `${environment.apiBaseUrl}/appointments/7/reschedules`;
    http.expectOne(url).flush({data:[proposal]}); f.detectChanges();
    const buttons = () => Array.from(f.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons().find(b => b.textContent?.includes('Chọn giờ mới'))!.click(); f.detectChanges();
    http.expectNone(url + '/3/accept');
    buttons().find(b => b.textContent?.includes('Đồng ý đổi giờ'))!.click(); f.detectChanges();
    f.componentInstance.respond(proposal as any, 'accept');
    const request = http.expectOne(url + '/3/accept'); expect(request.request.method).toBe('PATCH');
    request.flush({data:{...proposal,status:'ACCEPTED',replacementAppointmentId:15}});
    http.expectOne(url).flush({data:[{...proposal,status:'ACCEPTED',replacementAppointmentId:15}]}); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Đã tạo lịch mới #15');
    expect(buttons().some(b => b.textContent?.includes('Chọn giờ mới'))).toBeFalse();
  });
  it('keeps history and explains failure when target has been occupied', () => {
    const f = TestBed.createComponent(RescheduleDialogComponent); f.detectChanges();
    const url = `${environment.apiBaseUrl}/appointments/7/reschedules`;
    http.expectOne(url).flush({data:[proposal]});
    f.componentInstance.respond(proposal as any, 'accept');
    http.expectOne(url + '/3/accept').flush({message:'Giờ khám đã có người đặt'}, {status:409,statusText:'Conflict'});
    http.expectOne(url).flush({data:[proposal]}); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Giờ khám đã có người đặt');
    expect(f.componentInstance.busy).toBeFalse();
  });
  it('renders expired proposals without acceptance controls', () => {
    const f = TestBed.createComponent(RescheduleDialogComponent); f.detectChanges();
    http.expectOne(`${environment.apiBaseUrl}/appointments/7/reschedules`).flush({data:[{...proposal,expiresAt:'2020-01-01T00:00:00'}]}); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Hết hạn');
    expect(f.nativeElement.textContent).not.toContain('Chọn giờ mới');
  });
  it('admin selects a real slot and sends a proposal without changing the old appointment', () => {
    TestBed.inject(MAT_DIALOG_DATA).admin = true;
    const f = TestBed.createComponent(RescheduleDialogComponent); f.detectChanges();
    const url = `${environment.apiBaseUrl}/admin/appointments/7/reschedules`;
    http.expectOne(url).flush({data:[]});
    http.expectOne(r => r.url.endsWith('/doctors/2/available-dates')).flush({data:[{date:'2099-05-02',availableSlots:1}]});
    f.componentInstance.date = '2099-05-02'; f.componentInstance.loadSlots();
    http.expectOne(r => r.url.endsWith('/doctors/2/available-slots')).flush({data:[{id:8,startAt:proposal.targetStartAt,endAt:proposal.targetEndAt}]});
    f.componentInstance.slotId = 8; f.componentInstance.reason = '  Đổi giờ  '; f.componentInstance.expiresAt = '2099-04-30T09:00';
    f.componentInstance.propose();
    const post = http.expectOne(url); expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({slotId:8,reason:'Đổi giờ',expiresAt:'2099-04-30T09:00:00'});
    post.flush({data:proposal}); http.expectOne(url).flush({data:[proposal]}); f.detectChanges();
    expect(a.status).toBe('CONFIRMED');
    expect(f.nativeElement.textContent).toContain('Rút đề xuất');
  });
});
