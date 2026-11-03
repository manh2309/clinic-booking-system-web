import {Subject} from 'rxjs';
import {AccountSettingsComponent} from './account-settings.component';
import {OwnAccountService} from '../../../core/services/own-account.service';
import {AuthService} from '../../../core/services/auth.service';
describe('Own password form',()=>{
 it('keeps the session after a rejected change and prevents double submit',()=>{
  const pending=new Subject<any>();const password=jasmine.createSpy().and.returnValue(pending);const logout=jasmine.createSpy();
  const c=new AccountSettingsComponent({password} as unknown as OwnAccountService,{logout} as unknown as AuthService);c.current='OldPassword123!';c.next=c.confirm='NewPassword123!';
  c.change();c.change();expect(password).toHaveBeenCalledTimes(1);pending.error(new Error('wrong password'));expect(logout).not.toHaveBeenCalled();expect(c.busy).toBeFalse();expect(c.passwordError).toContain('Không đổi được');
 });
 it('clears password fields and logs out only after success',()=>{
  const pending=new Subject<any>();const logout=jasmine.createSpy();const c=new AccountSettingsComponent({password:()=>pending} as unknown as OwnAccountService,{logout} as unknown as AuthService);
  c.current='OldPassword123!';c.next=c.confirm='NewPassword123!';c.change();expect(logout).not.toHaveBeenCalled();pending.next({});expect(logout).toHaveBeenCalledTimes(1);expect(c.current+c.next+c.confirm).toBe('');
 });
});
