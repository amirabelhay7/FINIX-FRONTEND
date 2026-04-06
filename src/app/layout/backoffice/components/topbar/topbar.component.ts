import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: false
})
export class TopbarComponent {

  @Input() currentPage: string = 'dashboard';
  @Input() currentTheme: 'light' | 'dark' = 'light';
  @Output() themeToggled = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();

  searchValue: string = '';
  hasNotifications: boolean = true;

  onToggleTheme(): void {
    this.themeToggled.emit();
  }

  onImport(): void {
    console.log('Import clicked');
  }

  goToNotifications(): void {
    console.log('Go to notifications');
  }

  openHelp(): void {
    console.log('Help opened');
  }

  pageMap: any = {
    dashboard:     { title: "Dashboard",              breadcrumb: "Dashboard" },
    clients:       { title: "Clients",                breadcrumb: "Clients" },
    credits:       { title: "Credits & Files",        breadcrumb: "Credits" },
    repayments:    { title: "Repayments",             breadcrumb: "Repayments" },
    vehicles:      { title: "Vehicles",               breadcrumb: "Vehicles" },
    insurance:     { title: "Insurance",              breadcrumb: "Insurance" },
    risk:          { title: "Risk & Scoring",         breadcrumb: "Risk" },
    rapports:      { title: "Reports",                breadcrumb: "Reports" },
    notifications: { title: "Alerts & Notifications", breadcrumb: "Notifications" },
    settings:      { title: "Settings",               breadcrumb: "Settings" }
  };
}
