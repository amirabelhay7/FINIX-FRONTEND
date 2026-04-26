import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class ClientDashboard implements OnInit {
  firstName = 'Utilisateur';

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.firstName = (user.name || 'Utilisateur').split(' ')[0];
      }
    } catch { }
  }
}
