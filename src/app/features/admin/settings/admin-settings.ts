import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-admin-settings',
  standalone: false,
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminSettings {
  notificationsConfig: any = {
    overdueSms: true,
    renewalReminder: true,
    monthlyReport: true,
    fileAlert: true,
    autoScoring: false,
  };

  toggleConfig(key: string): void {
    if (this.notificationsConfig && key in this.notificationsConfig) {
      this.notificationsConfig[key] = !this.notificationsConfig[key];
    }
  }
}

