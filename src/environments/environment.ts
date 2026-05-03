export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8082/api',
  apiEndpoints: {
    auth: '/auth',
    credit: '/credit/request-loans',
    event: '/event',
    insurance: '/insurance',
    repayment: '/repayment',
    user: '/user',
    /** Must match backend {@code VehicleController} base path {@code /api/vehicles}. */
    vehicle: '/vehicles',
    wallet: '/wallet',
    score: '/score'
  }
};
