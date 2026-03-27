import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

/**
 * One field for a 6-digit code (avoids multi-input focus / CD bugs).
 * Still exposes `digits: string[6]` for existing parents.
 */
@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="otp-wrap">
      <input
        #inp
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        spellcheck="false"
        class="otp-field"
        [attr.aria-label]="ariaLabel"
        [placeholder]="placeholder"
        (input)="onInput($event)"
        (paste)="onPaste($event)"
      />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .otp-wrap {
        display: flex;
        justify-content: center;
        margin: 0.5rem 0 1rem;
      }
      .otp-field {
        box-sizing: border-box;
        width: 100%;
        max-width: min(320px, 100%);
        height: 56px;
        padding: 0 1rem;
        font-family: 'Sora', ui-monospace, monospace;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: 0.45em;
        text-indent: 0.2em;
        text-align: center;
        color: #0b1c2d;
        background: #f5f7fa;
        border: 2px solid #dde4ef;
        border-radius: 14px;
        outline: none;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }
      .otp-field::placeholder {
        color: #c5d0e0;
        letter-spacing: 0.35em;
      }
      .otp-field:focus {
        background: #fff;
        border-color: #1f6fea;
        box-shadow: 0 0 0 4px rgba(31, 111, 234, 0.12);
      }
    `,
  ],
})
export class OtpInputComponent implements OnChanges {
  @Input({ required: true }) digits!: string[];
  @Output() digitsChange = new EventEmitter<string[]>();

  @Input() placeholder = '••••••';
  @Input() ariaLabel = 'Verification code';

  @ViewChild('inp') private inp?: ElementRef<HTMLInputElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['digits'] || !this.digits || this.digits.length !== 6) return;
    const allEmpty = this.digits.every((d) => !d || String(d).trim() === '');
    if (allEmpty) {
      // Only clear the DOM — parent already has empty digits (avoid emit loop).
      queueMicrotask(() => {
        const el = this.inp?.nativeElement;
        if (el) el.value = '';
      });
    }
  }

  private emitFromString(v: string): void {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 6);
    const arr = Array.from({ length: 6 }, (_, i) => digits[i] ?? '');
    this.digitsChange.emit(arr);
  }

  onInput(event: Event): void {
    const t = event.target as HTMLInputElement;
    const digits = t.value.replace(/[^0-9]/g, '').slice(0, 6);
    t.value = digits;
    this.emitFromString(digits);
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').replace(/[^0-9]/g, '').slice(0, 6);
    const el = this.inp?.nativeElement;
    if (el) {
      el.value = text;
      el.focus();
    }
    this.emitFromString(text);
  }
}
