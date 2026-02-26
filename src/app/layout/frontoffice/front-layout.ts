import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-front-layout',
  standalone: false,
  templateUrl: './front-layout.html',
  styleUrl: './front-layout.scss',
})
export class FrontLayout {
  protected readonly mobileMenuOpen = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected readonly navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Credit', path: '/credit' },
    { label: 'Scoring', path: '/scoring' },
    { label: 'Wallet', path: '/wallet' },
    { label: 'Insurance', path: '/insurance' },
    { label: 'Repayment', path: '/repayment' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
