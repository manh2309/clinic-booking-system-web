import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

export type StatusType =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'active'
  | 'inactive';

const STATUS_CONFIG: Record<StatusType, { label: string; cssClass: string }> = {
  pending:   { label: 'Chờ xác nhận', cssClass: 'chip-pending' },
  confirmed: { label: 'Đã xác nhận',  cssClass: 'chip-confirmed' },
  completed: { label: 'Hoàn thành',   cssClass: 'chip-completed' },
  cancelled: { label: 'Đã hủy',       cssClass: 'chip-cancelled' },
  active:    { label: 'Hoạt động',    cssClass: 'chip-active' },
  inactive:  { label: 'Tạm ngưng',    cssClass: 'chip-inactive' },
};

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <span class="status-chip {{ config.cssClass }}">
      {{ config.label }}
    </span>
  `,
  styles: [`
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .chip-pending   { background: #fff3e0; color: #e65100; }
    .chip-confirmed { background: #e3f2fd; color: #1565c0; }
    .chip-completed { background: #e8f5e9; color: #2e7d32; }
    .chip-cancelled { background: #fce4ec; color: #b71c1c; }
    .chip-active    { background: #e8f5e9; color: #2e7d32; }
    .chip-inactive  { background: #f5f5f5; color: #616161; }
  `],
})
export class StatusChipComponent {
  @Input() set status(value: StatusType) {
    this.config = STATUS_CONFIG[value] ?? { label: value, cssClass: '' };
  }

  config = STATUS_CONFIG['pending'];
}
