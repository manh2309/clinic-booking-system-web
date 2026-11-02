import { HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('Session errors from outstanding requests', () => {
  let token: string | null;
  let storage: jasmine.SpyObj<StorageService>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    token = 'old-session';
    storage = jasmine.createSpyObj('storage', ['getToken','clearAll']);
    storage.getToken.and.callFake(() => token);
    storage.clearAll.and.callFake(() => { token = null; });
    router = jasmine.createSpyObj('router',['navigate']);
    TestBed.configureTestingModule({providers:[{provide:StorageService,useValue:storage},{provide:Router,useValue:router}]});
  });
  function pending(): Subject<HttpEvent<unknown>> {
    const response = new Subject<HttpEvent<unknown>>();
    TestBed.runInInjectionContext(() => jwtInterceptor(new HttpRequest('GET','/api/v1/appointments/me'), () => response)).subscribe({error:()=>{}});
    return response;
  }
  it('clears an expired current session and returns to login', () => {
    const response = pending(); response.error(new HttpErrorResponse({status:401}));
    expect(storage.clearAll).toHaveBeenCalledTimes(1); expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  for (const status of [401,403]) {
    it(`does not redirect or clear a new login when an old request returns ${status}`, () => {
      const response = pending(); token = 'new-session'; response.error(new HttpErrorResponse({status}));
      expect(storage.clearAll).not.toHaveBeenCalled(); expect(router.navigate).not.toHaveBeenCalled();
    });
  }
  it('does not log out a current user on a forbidden operation', () => {
    const response = pending(); response.error(new HttpErrorResponse({status:403}));
    expect(storage.clearAll).not.toHaveBeenCalled(); expect(router.navigate).toHaveBeenCalledWith(['/403']);
  });
  it('does not send stale credentials to public catalog GETs', () => {
    for (const path of ['/api/v1/doctors', '/api/v1/doctors/1', '/api/v1/doctors/1/available-slots?date=2090-10-26', '/api/v1/doctors/1/available-dates', '/api/v1/specialties']) {
      let authorization: string | null = 'not inspected';
      const response = new Subject<HttpEvent<unknown>>();
      TestBed.runInInjectionContext(() => jwtInterceptor(new HttpRequest('GET', path), req => {authorization = req.headers.get('Authorization'); return response;})).subscribe({error: () => {}});
      expect(authorization).toBeNull(); response.error(new HttpErrorResponse({status:401}));
    }
    expect(storage.clearAll).not.toHaveBeenCalled(); expect(router.navigate).not.toHaveBeenCalled();
  });
  it('still authenticates doctor private reads and booking mutations', () => {
    for (const request of [new HttpRequest('GET', '/api/v1/doctors/me'), new HttpRequest('POST', '/api/v1/appointments', {slotId:1})]) {
      TestBed.runInInjectionContext(() => jwtInterceptor(request, req => {expect(req.headers.get('Authorization')).toBe('Bearer old-session'); return new Subject<HttpEvent<unknown>>();})).subscribe();
    }
  });

});
