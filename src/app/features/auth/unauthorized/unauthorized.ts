import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: false,
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class UnauthorizedComponent {
  userRole = '';
  roleLabel = '';

  private roleLabels: Record<string, string> = {
    admin: 'Administrateur',
    agent: 'Agent IMF',
    insurer: 'Assureur',
    client: 'Client',
    seller: 'Vendeur',
  };

  private roleRoutes: Record<string, string> = {
    admin: '/backoffice',
    agent: '/agent',
    insurer: '/insurer',
    client: '/client',
    seller: '/seller',
  };

  constructor(private router: Router, private authService: AuthService) {
    const role = this.authService.getRole()?.toLowerCase() || '';
    this.userRole = role;
    this.roleLabel = this.roleLabels[role] || role;
  }

  goToMySpace(): void {
    const route = this.roleRoutes[this.userRole] || '/';
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
