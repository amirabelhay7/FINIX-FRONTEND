import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  /** 'danger' (red), 'warning' (amber), 'primary' (blue) */
  @Input() variant: 'danger' | 'warning' | 'primary' = 'danger';
  @Input() confirmLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.confirmLoading) this.confirm.emit();
  }

  onCancel(): void {
    if (!this.confirmLoading) this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('confirm-dialog-backdrop')) {
      this.onCancel();
    }
  }

  get iconName(): string {
    switch (this.variant) {
      case 'danger': return 'delete_forever';
      case 'warning': return 'warning';
      default: return 'help_outline';
    }
  }
}
