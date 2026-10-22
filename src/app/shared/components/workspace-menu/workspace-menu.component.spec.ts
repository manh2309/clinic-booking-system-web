import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { WorkspaceMenuComponent } from './workspace-menu.component';

describe('Workspace mobile navigation', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports:[WorkspaceMenuComponent,RouterTestingModule,NoopAnimationsModule]}).compileComponents();
  });
  it('uses the supplied workspace routes without adding links for other roles', async () => {
    const fixture = TestBed.createComponent(WorkspaceMenuComponent);
    fixture.componentInstance.items=[{label:'Lịch hẹn',route:'/doctor/appointments',icon:'event_note'},{label:'Thông báo',route:'/doctor/notifications',icon:'notifications'}];
    fixture.detectChanges();fixture.nativeElement.querySelector('button').click();fixture.detectChanges();await fixture.whenStable();
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const hrefs = Array.from(overlay.querySelectorAll('a')).map(a=>a.getAttribute('href'));
    expect(hrefs).toEqual(['/doctor/appointments','/doctor/notifications']);
    fixture.destroy();TestBed.inject(OverlayContainer).ngOnDestroy();
  });
});
