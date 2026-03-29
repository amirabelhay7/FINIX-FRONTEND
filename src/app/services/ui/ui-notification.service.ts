import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UINotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number; // Auto-dismiss after ms (0 = no auto-dismiss)
  timestamp: number;
  read: boolean;
}

export interface LoadingState {
  id: string;
  message: string;
  progress?: number; // 0-100 for progress bars
  showProgress?: boolean;
  cancellable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UINotificationService {
  private notifications = new BehaviorSubject<UINotification[]>([]);
  private loadingStates = new BehaviorSubject<LoadingState[]>([]);

  // Observable streams
  getNotifications(): Observable<UINotification[]> {
    return this.notifications.asObservable();
  }

  getLoadingStates(): Observable<LoadingState[]> {
    return this.loadingStates.asObservable();
  }

  // Notification methods
  showNotification(notification: Omit<UINotification, 'id' | 'timestamp' | 'read'>): string {
    const id = this.generateId();
    const fullNotification: UINotification = {
      id,
      timestamp: Date.now(),
      read: false,
      duration: notification.duration || 5000, // Default 5 seconds
      ...notification
    };

    const current = this.notifications.value;
    this.notifications.next([...current, fullNotification]);

    // Auto-dismiss if duration is set
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.dismissNotification(id);
      }, fullNotification.duration);
    }

    return id;
  }

  dismissNotification(id: string): void {
    const current = this.notifications.value;
    this.notifications.next(current.filter(n => n.id !== id));
  }

  markAsRead(id: string): void {
    const current = this.notifications.value;
    this.notifications.next(
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    const current = this.notifications.value;
    this.notifications.next(current.map(n => ({ ...n, read: true })));
  }

  clearAll(): void {
    this.notifications.next([]);
  }

  // Convenience methods
  success(title: string, message: string, duration?: number): string {
    return this.showNotification({ title, message, type: 'success', duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.showNotification({ title, message, type: 'warning', duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.showNotification({ title, message, type: 'error', duration: 0 }); // No auto-dismiss for errors
  }

  info(title: string, message: string, duration?: number): string {
    return this.showNotification({ title, message, type: 'info', duration });
  }

  // Loading state methods
  showLoading(message: string, options?: { showProgress?: boolean; cancellable?: boolean }): string {
    const id = this.generateId();
    const loadingState: LoadingState = {
      id,
      message,
      progress: 0,
      showProgress: options?.showProgress || false,
      cancellable: options?.cancellable || false
    };

    const current = this.loadingStates.value;
    this.loadingStates.next([...current, loadingState]);

    return id;
  }

  updateLoadingProgress(id: string, progress: number): void {
    const current = this.loadingStates.value;
    this.loadingStates.next(
      current.map(state => 
        state.id === id ? { ...state, progress } : state
      )
    );
  }

  updateLoadingMessage(id: string, message: string): void {
    const current = this.loadingStates.value;
    this.loadingStates.next(
      current.map(state => 
        state.id === id ? { ...state, message } : state
      )
    );
  }

  hideLoading(id: string): void {
    const current = this.loadingStates.value;
    this.loadingStates.next(current.filter(state => state.id !== id));
  }

  hideAllLoading(): void {
    this.loadingStates.next([]);
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.value.filter(n => !n.read).length;
  }

  // Get active loading count
  getActiveLoadingCount(): number {
    return this.loadingStates.value.length;
  }
}
