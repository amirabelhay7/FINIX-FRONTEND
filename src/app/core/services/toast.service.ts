import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  showSuccess(text: string): void {
    this.pushToast('success', text);
  }

  showError(text: string): void {
    this.pushToast('error', text);
  }

  showInfo(text: string): void {
    this.pushToast('info', text);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private pushToast(type: ToastType, text: string): void {
    if (!text) return;
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, type, text };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}

