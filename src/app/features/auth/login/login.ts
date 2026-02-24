import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  selectedPortalRole = '';

  constructor(private router: Router) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selectPortalRole(role: string) {
    this.selectedPortalRole = role;
  }

  onSubmit() {
    // Placeholder — will connect to AuthService
    console.log('Login submitted', { email: this.email });
  }
}
