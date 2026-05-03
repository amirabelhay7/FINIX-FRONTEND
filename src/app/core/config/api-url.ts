import { environment } from '../../../environments/environment';

/**
 * URL complète pour un chemin API (ex. `/api/auth/login`).
 * Si `environment.apiBaseUrl` est vide, l’URL est relative (proxy `ng serve` → backend :8082).
 */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = (environment.apiBaseUrl ?? '').replace(/\/$/, '');
  return base ? `${base}${p}` : p;
}
