export interface Environment {
  apiBaseUrl: string;
  /** Enable verbose API console logging in dev. */
  apiDebug: boolean;
}

export const environment: Environment = {
  /**
   * Base URL for backend APIs.
   * In dev we proxy /api to http://localhost:8081 via proxy.conf.json
   */
  apiBaseUrl: '/api',
  apiDebug: true,
};

