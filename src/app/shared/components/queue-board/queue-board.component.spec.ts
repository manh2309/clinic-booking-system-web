import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { QueueBoardComponent } from './queue-board.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VisitResponse } from '../../../core/models/domain.model';

const visit = (): VisitResponse => ({id:1,appointmentId:8,doctorId:2,doctorName:'Bác sĩ',patientName:'Bệnh nhân kiểm thử '.repeat(6),
  appointmentStartAt:new Date(Date.now()-60000).toISOString(),appointmentEndAt:new Date(Date.now()+60000).toISOString(),
  status:'WAITING',checkedInAt:new Date().toISOString(),priorityAt:new Date().toISOString()});
const board = (active: VisitResponse | null = null, waiting: VisitResponse[] = []) => ({code:1000,message:'Success',
  data:{date:new Date().toISOString().slice(0,10),activeVisit:active,waiting:{content:waiting,page:0,size:20,totalElements:waiting.length,totalPages:1,last:true}}});

describe('Clinic queue board', () => {
  let service: jasmine.SpyObj<AppointmentService>;
  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('appointments',['queue','startVisit','cancelReception']);
    service.queue.and.returnValue(of(board()));
    TestBed.configureTestingModule({imports:[QueueBoardComponent,NoopAnimationsModule,RouterTestingModule],providers:[
      {provide:AppointmentService,useValue:service},{provide:DoctorService,useValue:{getAllForAdmin:() => of({data:{content:[],last:true}})}},
      {provide:NotificationService,useValue:{changed:new Subject<void>()}}]});
  });
  it('does not start a second patient while one is being examined', () => {
    const waiting = visit(); service.queue.and.returnValue(of(board({...waiting,status:'IN_PROGRESS'},[waiting])));
    const f = TestBed.createComponent(QueueBoardComponent); f.detectChanges();
    f.componentInstance.start(waiting); expect(service.startVisit).not.toHaveBeenCalled();
    const button = Array.from(f.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(b => b.textContent?.includes('Bắt đầu khám'));
    expect(button?.disabled).toBeTrue(); f.destroy();
  });
  it('blocks repeated starts and refreshes active visit after success', () => {
    const waiting = visit(); const response = new Subject<any>(); service.startVisit.and.returnValue(response);
    service.queue.and.returnValues(of(board(null,[waiting])),of(board({...waiting,status:'IN_PROGRESS'})));
    const f = TestBed.createComponent(QueueBoardComponent); f.detectChanges();
    f.componentInstance.start(waiting); f.componentInstance.start(waiting);
    expect(service.startVisit).toHaveBeenCalledOnceWith(8);
    response.next({data:{...waiting,status:'IN_PROGRESS'}}); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Đang khám · Lịch #8'); f.destroy();
  });
  it('shows a conflict and reloads instead of pretending the start succeeded', () => {
    const waiting = visit(); service.queue.and.returnValue(of(board(null,[waiting])));
    service.startVisit.and.returnValue(throwError(() => ({error:{message:'Bác sĩ đang bận'}})));
    const f = TestBed.createComponent(QueueBoardComponent); f.detectChanges(); f.componentInstance.start(waiting); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Bác sĩ đang bận'); expect(f.componentInstance.busy).toBeFalse(); f.destroy();
  });
  it('requires a reason to withdraw reception and uses the appointment id', () => {
    const f = TestBed.createComponent(QueueBoardComponent); f.componentInstance.admin = true; f.detectChanges();
    f.componentInstance.cancelTarget = visit(); f.componentInstance.reason = '   '; f.componentInstance.cancelReception();
    expect(service.cancelReception).not.toHaveBeenCalled();
    service.cancelReception.and.returnValue(of({code:1000,message:'Success',data:{...visit(),status:'CANCELED'}}));
    f.componentInstance.reason = '  Bệnh nhân rời phòng khám  '; f.componentInstance.cancelReception();
    expect(service.cancelReception).toHaveBeenCalledOnceWith(8,'Bệnh nhân rời phòng khám'); f.destroy();
  });
  for (const width of [390,1440]) {
    it(`renders waiting and active visits without overflow at ${width}px`, () => {
      service.queue.and.returnValue(of(board({...visit(),status:'IN_PROGRESS'},[visit()])));
      const f = TestBed.createComponent(QueueBoardComponent); const host = f.nativeElement as HTMLElement;
      host.style.width = width + 'px'; host.style.display = 'block'; f.detectChanges();
      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1);
      expect(host.textContent).toContain('Ghi kết quả và hoàn thành'); f.destroy();
    });
  }
});
