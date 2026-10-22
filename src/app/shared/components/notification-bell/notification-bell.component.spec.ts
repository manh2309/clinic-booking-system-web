import { Subject, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationBellComponent } from './notification-bell.component';

describe('Notification count', () => {
  it('shows an unavailable count on errors and refreshes after a change', () => {
    const service = jasmine.createSpyObj<NotificationService>('NotificationService', ['unreadCount'], {changed:new Subject<void>()});
    service.unreadCount.and.returnValue(throwError(() => new Error('offline')));
    const component = new NotificationBellComponent(service, {events:new Subject()} as unknown as Router);
    component.ngOnInit(); expect(component.count).toBeNull();
    service.unreadCount.and.returnValue(of({code:1000, message:'Success', data:3}));
    service.changed.next(); expect(component.count).toBe(3);
    component.ngOnDestroy(); service.changed.next(); expect(service.unreadCount).toHaveBeenCalledTimes(2);
  });
});
