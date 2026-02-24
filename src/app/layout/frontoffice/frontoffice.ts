import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  templateUrl: './frontoffice.html',
  styleUrl: './frontoffice.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class Frontoffice implements OnInit {

  // User role and authentication state
  userRole: string = '';
  isLoggedIn: boolean = false;
  currentUser: any = null;
  showUserMenu: boolean = false;
  showBreadcrumbs: boolean = false;
  currentModule: string = '';
  flashMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize user state (this would come from authentication service)
    this.checkUserAuthentication();
  }

  checkUserAuthentication() {
    // This would typically get user data from an authentication service
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (token && userData) {
      this.isLoggedIn = true;
      this.currentUser = JSON.parse(userData);
      this.userRole = this.currentUser?.role || 'CLIENT';
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
      this.userRole = '';
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.userRole = '';
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }

  // Method to set flash messages
  setFlashMessage(message: string) {
    this.flashMessage = message;
    setTimeout(() => {
      this.flashMessage = '';
    }, 5000);
  }

  // Method to set current module for breadcrumbs
  setCurrentModule(module: string) {
    this.currentModule = module;
    this.showBreadcrumbs = true;
  }
}
