import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="otp-wrap flex justify-center gap-3 pt-2">
      <input
        *ngFor="let d of digits; let i = index"
        class="w-12 h-12 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all"
        type="text"
        maxlength="1"
        inputmode="numeric"
        [value]="digits[i]"
        (input)="onInput(i, $event)"
        (keydown)="onKeydown(i, $event)"
      />
    </div>
  `,
})
export class OtpInputComponent {
  @Input({ required: true }) digits!: string[];
  @Output() digitsChange = new EventEmitter<string[]>();

  constructor(private host: ElementRef<HTMLElement>) {}

  private focusInput(index: number): void {
    const inputs = this.host.nativeElement.querySelectorAll<HTMLInputElement>('input');
    inputs[index]?.focus();
  }

  onInput(index: number, event: any): void {
    const raw = String(event.target.value ?? '');
    const value = raw.replace(/[^0-9]/g, '').slice(-1);

    const next = [...this.digits];
    next[index] = value;
    this.digitsChange.emit(next);

    if (value && index < next.length - 1) this.focusInput(index + 1);
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key !== 'Backspace') return;

    const next = [...this.digits];
    if (next[index]) {
      next[index] = '';
      this.digitsChange.emit(next);
      return;
    }

    if (index > 0) this.focusInput(index - 1);
  }
}

