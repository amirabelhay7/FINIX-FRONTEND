import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  adminName = 'Admin';
  adminInitials = 'A';

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.adminName = user.name || 'Admin';
        this.adminInitials = this.adminName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
    } catch {}
  }

}
