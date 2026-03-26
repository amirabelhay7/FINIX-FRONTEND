import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-agent-shell',
  standalone: false,
  templateUrl: './agent-shell.html',
  styleUrl: './agent-shell.css',
  encapsulation: ViewEncapsulation.None,
})
export class AgentShell implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
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

  navigate(path: string): void {
    void this.router.navigate([path]);
  }
}

