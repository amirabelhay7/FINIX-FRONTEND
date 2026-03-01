import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: false
})
export class TopbarComponent {

  @Input() currentPage: string = 'dashboard';


  searchValue: string = '';
  hasNotifications: boolean = true;


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
    dashboard:      { title: "Dashboard", breadcrumb: "Dashboard" },
    clients:        { title: "Clients", breadcrumb: "Clients" },
    credits:        { title: "Credits & Dossiers", breadcrumb: "Credits" },
    repayments:     { title: "Repayments", breadcrumb: "Repayments" },
    vehicles:       { title: "Vehicles", breadcrumb: "Vehicles" },
    insurance:      { title: "Insurance", breadcrumb: "Insurance" },
    risk:           { title: "Risk & Scoring", breadcrumb: "Risk" },
    rapports:       { title: "Rapports", breadcrumb: "Rapports" },
    notifications:  { title: "Alerts & Notifications", breadcrumb: "Notifications" },
    settings:       { title: "Settings", breadcrumb: "Settings" }
  };
}
