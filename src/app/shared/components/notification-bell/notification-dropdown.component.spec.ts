import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { NotificationBellComponent } from './notification-bell.component';
import { NotificationService, NotificationResponse } from '../../../core/services/notification.service';

const item = (id: number): NotificationResponse => ({id, appointmentId:id, type:'APPOINTMENT_BOOKED',
  title:'Đã đặt lịch khám', message:'Lịch hẹn kiểm thử', read:false, readAt:null, createdAt:'2026-10-20T08:00:00'});
const page = (content: NotificationResponse[], last = true) => ({code:1000, message:'Success',
  data:{content, page:0, size:10, totalElements:20, totalPages:2, last}});

describe('Notification dropdown', () => {
  let service: jasmine.SpyObj<NotificationService>;
  let component: NotificationBellComponent;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    service = jasmine.createSpyObj('NotificationService', ['getMine','unreadCount','markRead','markAllRead'], {changed:new Subject<void>()});
    service.unreadCount.and.returnValue(of({code:1000,message:'Success',data:20}));
    service.getMine.and.returnValue(of(page([item(1)], false)));
    router = jasmine.createSpyObj('Router', ['navigateByUrl'], {events:new Subject()});
    component = new NotificationBellComponent(service, router);
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());
  it('opens without navigating or marking anything read', () => {
    component.toggle();
    expect(component.opened).toBeTrue();
    expect(component.items.length).toBe(1);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(service.markRead).not.toHaveBeenCalled();
    expect(service.markAllRead).not.toHaveBeenCalled();
  });
  it('loads more inside the dropdown and retries the same failed page', () => {
    component.toggle();
    service.getMine.and.returnValue(throwError(() => new Error('offline')));
    component.load(true);
    expect(component.items.length).toBe(1);
    expect(component.retryMore).toBeTrue();
    service.getMine.and.returnValue(of(page([item(2)])));
    component.load(component.retryMore);
    expect(service.getMine).toHaveBeenCalledWith(1,10);
    expect(component.items.map(n => n.id)).toEqual([1,2]);
  });
  it('keeps unread states on failure and prevents duplicate bulk requests', () => {
    component.toggle();
    const pending = new Subject<any>(); service.markAllRead.and.returnValue(pending);
    component.markAll(); component.markAll();
    expect(service.markAllRead).toHaveBeenCalledTimes(1);
    expect(component.items[0].read).toBeFalse();
    pending.error(new Error('offline'));
    expect(component.items[0].read).toBeFalse();
    expect(component.actionError).not.toBe('');
    service.markAllRead.and.returnValue(of({code:1000,message:'Success',data:20}));
    component.markAll(); expect(component.items[0].read).toBeTrue();
  });
  it('marks a notice read before navigating to the correct workspace', () => {
    component.route = '/doctor/notifications'; component.toggle();
    service.markRead.and.returnValue(of({code:1000,message:'Success',data:{...item(1),read:true}}));
    component.openItem(component.items[0]);
    expect(service.markRead).toHaveBeenCalledWith(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/doctor/appointments');
    expect(component.opened).toBeFalse();
  });
  it('discards a late list response after closing', () => {
    const pending = new Subject<any>(); service.getMine.and.returnValue(pending);
    component.toggle(); component.close(); pending.next(page([item(9)]));
    expect(component.items).toEqual([]);
  });
  it('renders a dialog and closes with Escape', async () => {
    await TestBed.configureTestingModule({imports:[NotificationBellComponent, NoopAnimationsModule, RouterTestingModule],
      providers:[{provide:NotificationService,useValue:service}]}).compileComponents();
    const fixture = TestBed.createComponent(NotificationBellComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges(); await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const panel = overlay.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.textContent).toContain('Đánh dấu tất cả đã đọc');
    panel.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true}));
    fixture.detectChanges();
    expect(fixture.componentInstance.opened).toBeFalse();
    fixture.destroy();
  });
});
