import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

export interface TopbarNotificationItem {
  title: string;
  meta: string;
  targetPage?: string;
  requestId?: number;
  eventId?: number;
}

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: false
})
export class TopbarComponent {

  @Input() currentPage: string = 'dashboard';
  @Input() currentTheme: 'light' | 'dark' = 'light';
  @Input() notificationCount: number = 0;
  @Input() notificationItems: TopbarNotificationItem[] = [];
  @Output() themeToggled = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();
  @Output() notificationSelected = new EventEmitter<TopbarNotificationItem>();
  @Output() notificationsPanelOpened = new EventEmitter<void>();

  searchValue: string = '';
  showNotificationsDropdown: boolean = false;

  constructor(private host: ElementRef<HTMLElement>) {}
  get hasNotifications(): boolean {
    return this.notificationCount > 0;
  }

  onToggleTheme(): void {
    this.themeToggled.emit();
  }

  onImport(): void {
    console.log('Import clicked');
  }

  toggleNotificationsDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.notificationsPanelOpened.emit();
    }
  }

  closeNotificationsDropdown(): void {
    this.showNotificationsDropdown = false;
  }

  onNotificationItemClick(item: TopbarNotificationItem): void {
    this.notificationSelected.emit(item);
    this.showNotificationsDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showNotificationsDropdown) {
      return;
    }
    const target = event.target as Node | null;
    if (!target || !this.host.nativeElement.contains(target)) {
      this.showNotificationsDropdown = false;
    }
  }

  openHelp(): void {
    console.log('Help opened');
  }

  pageMap: any = {
    dashboard:      { title: "Dashboard", breadcrumb: "Dashboard" },
    clients:        { title: "Clients", breadcrumb: "Clients" },
    credits:        { title: "Credits & files", breadcrumb: "Credits" },
    repayments:     { title: "Repayments", breadcrumb: "Repayments" },
    delinquency:    { title: "Delinquency cases", breadcrumb: "Delinquency" },
    'grace-requests': { title: "Grace period requests", breadcrumb: "Grace requests" },
    analytics:      { title: "Repayment analytics", breadcrumb: "Analytics" },
    'penalty-tiers': { title: "Penalty tiers (business rules)", breadcrumb: "Penalty tiers" },
    vehicles:       { title: "Vehicles", breadcrumb: "Vehicles" },
    reservations:   { title: "Reservation requests", breadcrumb: "Reservations" },
    insurance:      { title: "Insurance", breadcrumb: "Insurance" },
    risk:           { title: "Risk & score", breadcrumb: "Risk" },
    rapports:       { title: "Reports", breadcrumb: "Reports" },
    events:         { title: "Events", breadcrumb: "Events" },
    users:          { title: "Users", breadcrumb: "Users" },
    notifications:  { title: "Alerts & notifications", breadcrumb: "Notifications" },
    settings:       { title: "Settings", breadcrumb: "Settings" }
  };
}
