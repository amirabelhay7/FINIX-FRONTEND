/**
 * Base URL du backend Spring Boot.
 *
 * - **'' (chaîne vide)** : en dev avec `ng serve`, les appels vont vers `/api/...` sur le même
 *   origine que l’app ; `proxy.conf.json` redirige vers `http://localhost:8082` (évite souvent
 *   les soucis de connexion / CORS).
 *
 * - **`http://localhost:8082`** : appels directs vers le backend (utile sans proxy, ou tests).
 *
 * Le port doit correspondre à `server.port` dans `finix_Backend` `application.properties`.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
  /** Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web). Must match backend `google.oauth.client-id`. */
  googleClientId: '935462295405-g6grs2gfgep891ff1a7jcr6i6mmtncjm.apps.googleusercontent.com',
};
