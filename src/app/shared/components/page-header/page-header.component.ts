import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgFor, NgIf, RouterLink],
  template: `
    <div class="page-header">
      <div class="page-header__content">
        <nav class="breadcrumb" *ngIf="breadcrumbs.length > 0">
          <span
            *ngFor="let item of breadcrumbs; let last = last"
            class="breadcrumb__item"
          >
            <a *ngIf="item.route && !last" [routerLink]="item.route" class="breadcrumb__link">
              {{ item.label }}
            </a>
            <span *ngIf="!item.route || last" [class.breadcrumb__active]="last">
              {{ item.label }}
            </span>
            <mat-icon *ngIf="!last" class="breadcrumb__separator">chevron_right</mat-icon>
          </span>
        </nav>
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header__actions" *ngIf="actions.length > 0">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;
    }

    .breadcrumb__item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
    }

    .breadcrumb__link {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .breadcrumb__active {
      color: var(--text-secondary);
    }

    .breadcrumb__separator {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-disabled);
    }

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 4px 0 0;
    }

    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  `],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actions: unknown[] = [];
}
