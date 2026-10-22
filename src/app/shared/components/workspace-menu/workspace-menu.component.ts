import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector:'app-workspace-menu', standalone:true,
  imports:[NgFor, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule],
  template:`<button mat-icon-button [matMenuTriggerFor]="navigation" aria-label="Mở menu điều hướng"><mat-icon>menu</mat-icon></button>
    <mat-menu #navigation="matMenu">
      <a mat-menu-item *ngFor="let item of items" [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>{{ item.icon }}</mat-icon><span>{{ item.label }}</span>
      </a>
    </mat-menu>`,
  styles:[`:host{display:none;} .active{background:#e0f2fe;} @media(max-width:768px){:host{display:inline-flex;flex-shrink:0;}}`],
})
export class WorkspaceMenuComponent {
  @Input() items: ReadonlyArray<{label:string; route:string; icon:string}> = [];
}
