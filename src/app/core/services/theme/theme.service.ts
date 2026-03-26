import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'finix_theme';

  initTheme(defaultTheme: ThemeMode): ThemeMode {
    const saved = this.getStoredTheme();
    const theme = saved ?? defaultTheme;
    this.applyTheme(theme);
    return theme;
  }

  toggleTheme(defaultTheme: ThemeMode): ThemeMode {
    const current = this.getStoredTheme() ?? defaultTheme;
    const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    return next;
  }

  private getStoredTheme(): ThemeMode | null {
    const raw = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    return raw === 'light' || raw === 'dark' ? raw : null;
  }

  private applyTheme(theme: ThemeMode): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

