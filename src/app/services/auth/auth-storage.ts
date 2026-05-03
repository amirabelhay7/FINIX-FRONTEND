/**
 * Clefs et acces localStorage partages entre AuthService et l'intercepteur HTTP.
 * Evite les desynchronisations et permet a l'intercepteur d'attacher le Bearer
 * sans dependre de la logique AuthService pour la lecture du token.
 */
export const FINIX_ACCESS_TOKEN_KEY = 'access_token';
export const FINIX_ROLE_KEY = 'finix_role';
export const FINIX_USER_KEY = 'currentUser';

function normalizeToken(raw: string | null): string | null {
  if (!raw) return null;
  let trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  if (!trimmed) return null;
  // Accept tokens accidentally stored as "Bearer xxx".
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.slice(7).trim() || null;
  }
  return trimmed;
}

function isJwtStillValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(payloadBase64)) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function readStoredAccessToken(): string | null {
  return normalizeToken(localStorage.getItem(FINIX_ACCESS_TOKEN_KEY))
    || normalizeToken(sessionStorage.getItem(FINIX_ACCESS_TOKEN_KEY));
}

export function clearFinixSessionStorage(): void {
  localStorage.removeItem(FINIX_ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(FINIX_ACCESS_TOKEN_KEY);
  localStorage.removeItem(FINIX_ROLE_KEY);
  sessionStorage.removeItem(FINIX_ROLE_KEY);
  localStorage.removeItem(FINIX_USER_KEY);
  sessionStorage.removeItem(FINIX_USER_KEY);
}
