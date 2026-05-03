import { Component, EventEmitter, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {

  @Output() pageChanged = new EventEmitter<string>();

  currentPage = 'dashboard';
  adminName = 'Admin';
  adminInitials = 'A';

  constructor() {}

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

  switchPage(page: string) {
    // Users is nested under Settings → mark settings as active in sidebar
    this.currentPage = page === 'users' ? 'settings' : page;
    this.pageChanged.emit(page);
  }

}
