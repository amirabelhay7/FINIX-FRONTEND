import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-admin-clients',
  standalone: false,
  templateUrl: './admin-clients.html',
  styleUrl: './admin-clients.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminClients implements OnInit {
  private readonly API = 'http://localhost:8081/api';

  clients: any[] = [];
  clientsLoading = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  private loadClients(): void {
    this.clientsLoading = true;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => {
        this.clients = users
          .filter((u: any) => u.role === 'CLIENT')
          .map((u: any) => ({
            id: u.id,
            initials: ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase(),
            name: (u.firstName || '') + ' ' + (u.lastName || ''),
            email: u.email || '—',
            phone: u.phoneNumber ? '+216 ' + u.phoneNumber : '—',
            cin: u.cin || '—',
            city: u.city || '—',
            status: 'Active',
            statusClass: 'b-actif',
          }));
        this.clientsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.clientsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}

