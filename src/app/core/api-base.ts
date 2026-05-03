/** Backend API root — align with other services (credit, auth). Override via window.__FINIX_API__ for prod if needed. */
export const API_BASE_URL =
  (typeof window !== 'undefined' && (window as unknown as { __FINIX_API__?: string }).__FINIX_API__) ||
  'http://localhost:8081/api';

export const INSURANCE_API_URL = `${API_BASE_URL}/insurance`;
