import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription, merge, filter, startWith, switchMap, catchError, of } from 'rxjs';
import { NotificationService, NotificationResponse } from '../../../core/services/notification.service';

@Component({
  selector:'app-notification-bell', standalone:true,
  imports:[NgIf, NgFor, DatePipe, OverlayModule, A11yModule, MatButtonModule, MatIconModule, MatBadgeModule],
  template:`
    <button #bell mat-icon-button cdkOverlayOrigin #origin="cdkOverlayOrigin" (click)="toggle()"
      aria-haspopup="dialog" [attr.aria-expanded]="opened"
      [attr.aria-label]="count === null ? 'Thông báo, chưa tải được số chưa đọc' : 'Thông báo, ' + count + ' chưa đọc'">
      <mat-icon [matBadge]="count !== null && count > 0 ? count : null" matBadgeColor="warn">notifications</mat-icon>
    </button>
    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOrigin]="origin" [cdkConnectedOverlayOpen]="opened"
      [cdkConnectedOverlayHasBackdrop]="true" cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayPositions]="positions" [cdkConnectedOverlayPush]="true" [cdkConnectedOverlayViewportMargin]="12"
      (backdropClick)="close()" (overlayKeydown)="onKey($event)">
      <section class="notification-dropdown" role="dialog" aria-label="Thông báo" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
        <header><h2>Thông báo</h2><button mat-icon-button aria-label="Đóng thông báo" (click)="close()"><mat-icon>close</mat-icon></button></header>
        <div class="toolbar">
          <button mat-button (click)="markAll()" [disabled]="markingAll || reading.size > 0 || loading || count === 0">
            {{ markingAll ? 'Đang cập nhật...' : 'Đánh dấu tất cả đã đọc' }}
          </button>
          <button mat-icon-button aria-label="Làm mới thông báo" (click)="load()" [disabled]="loading || markingAll || reading.size > 0"><mat-icon>refresh</mat-icon></button>
        </div>
        <p *ngIf="actionError" role="alert" class="message">{{ actionError }}</p>
        <div class="notification-list" aria-live="polite" [attr.aria-busy]="loading">
          <p *ngIf="loading" class="message">Đang tải thông báo...</p>
          <p *ngIf="error" role="alert" class="message">{{ error }} <button mat-button (click)="load(retryMore)">Thử lại</button></p>
          <p *ngIf="!loading && !error && !items.length" class="message">Chưa có thông báo.</p>
          <article *ngFor="let item of items" [class.unread]="!item.read">
            <button class="notification-link" (click)="openItem(item)" [disabled]="markingAll || reading.has(item.id)">
              <strong>{{ item.title }}<span *ngIf="!item.read" class="dot" aria-label="Chưa đọc"></span></strong>
              <time>{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</time>
              <span class="notification-message">{{ item.message }}</span>
            </button>
            <button mat-button *ngIf="!item.read" (click)="markRead(item)" [disabled]="markingAll || reading.has(item.id)">Đánh dấu đã đọc</button>
          </article>
          <button mat-button class="load-more" *ngIf="hasMore && !error" (click)="load(true)" [disabled]="loading || markingAll || reading.size > 0">Xem thêm</button>
        </div>
      </section>
    </ng-template>`,
  styles:[`
    .notification-dropdown{width:380px;max-width:calc(100vw - 24px);background:white;border:1px solid #dbe5ee;border-radius:16px;box-shadow:0 12px 40px #0f172a26;overflow:hidden;color:#0f172a;}
    header,.toolbar{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;gap:4px;}
    header h2{margin:0;font-size:18px;} .toolbar{border-bottom:1px solid #e2e8f0;padding-top:0;}
    .notification-list{max-height:min(440px,calc(100dvh - 210px));overflow-y:auto;overscroll-behavior:contain;}
    article{border-bottom:1px solid #e2e8f0;padding:8px 12px;} article.unread{background:#eff8ff;}
    .notification-link{display:block;width:100%;border:0;background:transparent;text-align:left;padding:6px 0;color:inherit;font:inherit;cursor:pointer;overflow-wrap:anywhere;}
    .notification-link strong{display:block;font-size:14px;} time{display:block;font-size:12px;color:#64748b;margin:5px 0;}
    .notification-message{font-size:13px;line-height:1.5;} .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#0284c7;margin-left:8px;}
    .notification-link:focus-visible{outline:2px solid #0284c7;outline-offset:2px;border-radius:4px;}
    .message{padding:12px;margin:0;font-size:14px;} .load-more{width:100%;}
  `],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @Input() route = '/patient/notifications';
  @ViewChild('bell', {read:ElementRef}) bell?: ElementRef<HTMLButtonElement>;
  readonly positions = [{originX:'end' as const, originY:'bottom' as const, overlayX:'end' as const, overlayY:'top' as const, offsetY:8}];
  count: number | null = null;
  opened = false;
  items: NotificationResponse[] = [];
  loading = false;
  error = '';
  actionError = '';
  markingAll = false;
  reading = new Set<number>();
  page = 0;
  hasMore = false;
  retryMore = false;
  private subscriptions = new Subscription();
  private listSubscription?: Subscription;
  constructor(private notifications: NotificationService, private router: Router) {}
  ngOnInit(): void {
    this.subscriptions.add(merge(this.notifications.changed, this.router.events.pipe(filter(e => e instanceof NavigationEnd)))
      .pipe(startWith(null), switchMap(() => this.notifications.unreadCount().pipe(catchError(() => of(null)))))
      .subscribe(res => { this.count = res?.data ?? null; }));
    this.subscriptions.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.close()));
  }
  toggle(): void {
    if (this.opened) { this.close(); return; }
    this.opened = true;
    this.actionError = '';
    this.load();
    this.notifications.changed.next();
  }
  close(): void {
    if (!this.opened) return;
    this.opened = false;
    this.listSubscription?.unsubscribe();
    this.loading = false;
    this.bell?.nativeElement.focus();
  }
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); this.close(); }
  }
  load(more = false): void {
    if (this.loading || this.markingAll || this.reading.size) return;
    const next = more ? this.page + 1 : 0;
    this.loading = true; this.error = ''; this.retryMore = more;
    if (!more) { this.items = []; this.hasMore = false; }
    this.listSubscription = this.notifications.getMine(next, 10).subscribe({
      next: res => {
        this.items = more ? [...this.items, ...res.data.content.filter(n => !this.items.some(old => old.id === n.id))] : res.data.content;
        this.page = next; this.hasMore = !res.data.last; this.loading = false;
      },
      error: () => { this.loading = false; this.error = 'Chưa tải được thông báo.'; },
    });
  }
  markAll(): void {
    if (this.markingAll || this.loading || this.reading.size || this.count === 0) return;
    this.markingAll = true; this.actionError = '';
    this.subscriptions.add(this.notifications.markAllRead().subscribe({
      next: () => { this.items.forEach(n => n.read = true); this.markingAll = false; },
      error: () => { this.markingAll = false; this.actionError = 'Chưa đánh dấu được tất cả thông báo. Hãy thử lại.'; },
    }));
  }
  markRead(item: NotificationResponse, navigate = false): void {
    if (this.markingAll || this.reading.has(item.id)) return;
    if (item.read) { if (navigate) this.navigate(item); return; }
    this.reading.add(item.id); this.actionError = '';
    this.subscriptions.add(this.notifications.markRead(item.id).subscribe({
      next: res => { Object.assign(item, res.data); this.reading.delete(item.id); if (navigate) this.navigate(item); },
      error: () => { this.reading.delete(item.id); this.actionError = 'Chưa đánh dấu được thông báo. Hãy thử lại.'; },
    }));
  }
  openItem(item: NotificationResponse): void { this.markRead(item, true); }
  private navigate(item: NotificationResponse): void {
    if (!item.appointmentId) return;
    this.close();
    this.router.navigateByUrl(this.route.startsWith('/doctor') ? '/doctor/appointments'
      : item.type === 'APPOINTMENT_COMPLETED' ? '/patient/medical-records' : '/patient/appointments');
  }
  ngOnDestroy(): void { this.listSubscription?.unsubscribe(); this.subscriptions.unsubscribe(); }
}
