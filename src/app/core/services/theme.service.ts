import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FinixTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'finix_theme';
  private renderer: Renderer2;
  private readonly _theme$ = new BehaviorSubject<FinixTheme>(this.getInitialTheme());

  readonly theme$ = this._theme$.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyTheme(this._theme$.value);
  }

  private getInitialTheme(): FinixTheme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as FinixTheme | null;
    return saved ?? 'light';
  }

  toggleTheme(): void {
    const next: FinixTheme = this._theme$.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: FinixTheme): void {
    this._theme$.next(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: FinixTheme): void {
    const body = document.body;
    this.renderer.removeClass(body, 'finix-light');
    this.renderer.removeClass(body, 'finix-dark');
    this.renderer.addClass(body, theme === 'dark' ? 'finix-dark' : 'finix-light');
  }
}

