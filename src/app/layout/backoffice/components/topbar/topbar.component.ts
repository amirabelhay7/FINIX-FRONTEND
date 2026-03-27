import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../services/notifications/notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: false,
})
export class TopbarComponent implements OnInit {
  @Input() currentPage: string = 'dashboard';
  @Input() currentTheme: 'light' | 'dark' = 'light';
  @Output() themeToggled = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();

  searchValue: string = '';
  hasNotifications = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.refreshUnread();
  }

  onToggleTheme(): void {
    this.themeToggled.emit();
  }

  onImport(): void {
    console.log('Import clicked');
  }

  goToNotifications(): void {
    void this.router.navigate(['/notifications']).then(() => this.refreshUnread());
  }

  openHelp(): void {
    console.log('Help opened');
  }

  pageMap: Record<string, { title: string; breadcrumb: string }> = {
    dashboard: { title: 'Dashboard', breadcrumb: 'Dashboard' },
    clients: { title: 'Clients', breadcrumb: 'Clients' },
    credits: { title: 'Credits & Files', breadcrumb: 'Credits' },
    repayments: { title: 'Repayments', breadcrumb: 'Repayments' },
    vehicles: { title: 'Vehicles', breadcrumb: 'Vehicles' },
    insurance: { title: 'Insurance', breadcrumb: 'Insurance' },
    risk: { title: 'Risk & Scoring', breadcrumb: 'Risk' },
    rapports: { title: 'Reports', breadcrumb: 'Reports' },
    marketing: { title: 'Marketing', breadcrumb: 'Marketing' },
    notifications: { title: 'Notifications', breadcrumb: 'Notifications' },
    users: { title: 'Users & Identity', breadcrumb: 'Users' },
    settings: { title: 'Settings', breadcrumb: 'Settings' },
  };

  private refreshUnread(): void {
    this.notificationService.unreadCount().subscribe({
      next: (r) => {
        this.hasNotifications = (r?.count ?? 0) > 0;
      },
      error: () => {
        this.hasNotifications = false;
      },
    });
  }
}
