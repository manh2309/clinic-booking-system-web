import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

describe('Authentication submission recovery', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('auth',['login','register','isAuthenticated','redirectToHome','hasRole']);
    auth.isAuthenticated.and.returnValue(false);
    router = jasmine.createSpyObj('router',['navigateByUrl','navigate']);
  });
  it('sends one login while pending and explains a locked account without discarding the form', () => {
    const response = new Subject<any>(); auth.login.and.returnValue(response);
    const c = new LoginComponent(new FormBuilder(),auth,router,{snapshot:{queryParams:{}}} as ActivatedRoute);
    c.ngOnInit(); c.loginForm.setValue({username:'qa_test',password:'qa_password'});
    c.onSubmit(); c.onSubmit(); expect(auth.login).toHaveBeenCalledTimes(1);
    response.error({status:403,error:{message:'Tài khoản đang bị khóa'}});
    expect(c.isLoading).toBeFalse(); expect(c.errorMessage).toBe('Tài khoản đang bị khóa');
    expect(c.loginForm.value.username).toBe('qa_test'); expect(auth.redirectToHome).not.toHaveBeenCalled();
  });
  it('does not register twice and keeps the entered details after a conflict', () => {
    const response = new Subject<any>(); auth.register.and.returnValue(response);
    const c = new RegisterComponent(new FormBuilder(),auth,router,{snapshot:{queryParams:{}}} as ActivatedRoute); c.ngOnInit();
    c.registerForm.setValue({username:'qa_test',fullName:'Người kiểm thử',email:'qa@example.invalid',phone:'0000000000',password:'qa_password',confirmPassword:'qa_password'});
    c.onSubmit(); c.onSubmit(); expect(auth.register).toHaveBeenCalledTimes(1);
    response.error({status:409});
    expect(c.isLoading).toBeFalse(); expect(c.registerForm.value.fullName).toBe('Người kiểm thử'); expect(auth.redirectToHome).not.toHaveBeenCalled();
  });
  it('keeps registration busy through automatic login and resumes the saved booking', () => {
    const registered = new Subject<any>(), loggedIn = new Subject<any>();
    auth.register.and.returnValue(registered); auth.login.and.returnValue(loggedIn); auth.hasRole.and.returnValue(true);
    const target = '/patient/booking/1?date=2090-10-26&slotId=12';
    const c = new RegisterComponent(new FormBuilder(),auth,router,{snapshot:{queryParams:{returnUrl:target}}} as unknown as ActivatedRoute);
    c.ngOnInit();
    c.registerForm.setValue({username:'qa_test',fullName:'Người kiểm thử',email:'qa@example.invalid',phone:'0000000000',password:'qa_password',confirmPassword:'qa_password'});
    c.onSubmit(); registered.next({}); c.onSubmit();
    expect(c.isLoading).toBeTrue(); expect(auth.register).toHaveBeenCalledTimes(1);
    loggedIn.next({}); expect(c.isLoading).toBeFalse(); expect(router.navigateByUrl).toHaveBeenCalledWith(target);
  });
  it('preserves a successful registration when automatic login fails', () => {
    const registered = new Subject<any>(), loggedIn = new Subject<any>();
    auth.register.and.returnValue(registered); auth.login.and.returnValue(loggedIn);
    const c = new RegisterComponent(new FormBuilder(),auth,router,{snapshot:{queryParams:{returnUrl:'/patient/doctors'}}} as unknown as ActivatedRoute);
    c.ngOnInit(); c.registerForm.setValue({username:'qa_test',fullName:'Người kiểm thử',email:'qa@example.invalid',phone:'0000000000',password:'qa_password',confirmPassword:'qa_password'});
    c.onSubmit(); registered.next({}); loggedIn.error({status:503});
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {queryParams:{registered:'1',returnUrl:'/patient/doctors'}});
    expect(c.errorMessage).toBe('');
  });

});
