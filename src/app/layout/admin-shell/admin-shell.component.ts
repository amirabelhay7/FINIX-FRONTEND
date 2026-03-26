import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: false,
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminShellComponent implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'light';
  currentPage = 'dashboard';

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.syncCurrentPageFromUrl();

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncCurrentPageFromUrl());
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  logout(): void {
    this.authService.logout();
  }

  onPageChange(page: string): void {
    void this.router.navigate(['/admin', page]);
  }

  private syncCurrentPageFromUrl(): void {
    const child = this.route.firstChild;
    const path = child?.snapshot.routeConfig?.path;
    this.currentPage = path && path.length > 0 ? path : 'dashboard';
  }
}

