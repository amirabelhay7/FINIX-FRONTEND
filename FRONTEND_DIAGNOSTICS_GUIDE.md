# FINIX Frontend - Diagnostics & Troubleshooting Guide

## Quick Start - Testing Backend Connectivity

### 1. Test All Endpoints (Browser Console)

```javascript
// Open browser DevTools (F12) → Console tab
// Inject the service and run diagnostics

// Option 1: Through Angular's dependency injection (if available)
ng.probe(document.body).injector.get('BackendDiagnosticsService').testAllEndpoints().subscribe(report => {
  console.table(report);
});

// Option 2: Quick manual test
fetch('http://localhost:8081/api/credit/request-loans').then(r => console.log(r.status));
fetch('http://localhost:8081/api/event/events').then(r => console.log(r.status));
```

### 2. View HTTP Request Logs

All HTTP requests are now logged to the browser console with:
- ✅ Method (GET, POST, PUT, DELETE)
- ✅ URL endpoint
- ✅ Status code
- ✅ Response time (ms)
- ✅ Request/response bodies

**Color coding:**
- 🔵 Blue: HTTP Requests
- 🟢 Green: Successful responses (2xx)
- 🔴 Red: Error responses (4xx, 5xx)
- 🟡 Yellow: Warnings

---

## Fixed Issues

### ✅ Fixed: Duplicate Service Class
**Problem:** Two files exporting the same `Credit` class
- ❌ `src/app/services/credit/credit.ts` (OLD)
- ✅ `src/app/services/credit/credit.service.ts` (CORRECT)

**Solution:** Deleted `credit.ts` and updated all imports

**Files updated:**
- `backoffice.component.ts` - Now imports from `credit.service.ts`
- `credit.service.spec.ts` - Now imports from `credit.service.ts`

---

### ✅ Fixed: Event Service Endpoint Fallbacks
**Problem:** Service tried 5 different endpoints, suggesting API inconsistency

**Before:**
```typescript
private readonly createEventEndpoints = [
  `/api/event/events`,
  `/api/events`,
  `/api/event`,
  `/api/events/create`,
  `/api/event/create`,
];
// With recursive fallback logic...
```

**After:**
```typescript
private readonly createEventUrl = `${this.apiBaseUrl}${this.apiEndpoints.event}/events`;
// Single, clean endpoint
```

---

### ✅ Added: Comprehensive Error Handling

All services now include:
- Error logging to console
- Detailed error messages with HTTP status codes
- Request/response tracking
- Error type differentiation (client vs server errors)

**Services updated:**
- `credit.service.ts` ✅
- `event.service.ts` ✅

Example error log:
```
❌ Server error: {
  status: 404,
  message: "Not Found",
  body: { error: "Resource not found" }
}
```

---

### ✅ Added: HTTP Logging Interceptor

New file: `src/app/services/auth/http-logging.interceptor.ts`

**Features:**
- Logs all HTTP requests with method, URL, timestamp
- Logs response status and timing
- Shows request/response bodies (except GET requests by default)
- Color-coded console output
- Automatic logout on 401 Unauthorized

**Example output:**
```
[HTTP] GET /api/credit/request-loans - ✅ 200 (125ms)
[HTTP] POST /api/event/events - ✅ 201 (89ms)
[HTTP] DELETE /api/credit/request-loans/1 - ❌ 500 (234ms)
```

---

### ✅ Added: Backend Diagnostics Service

New file: `src/app/services/backend-diagnostics.service.ts`

**Methods available:**

#### Test all configured endpoints:
```typescript
constructor(private diagnostics: BackendDiagnosticsService) {}

testBackend() {
  this.diagnostics.testAllEndpoints().subscribe(report => {
    console.log('Diagnostic Report:', report);
  });
}
```

#### Test Credit module only:
```typescript
this.diagnostics.testCreditEndpoints().subscribe(results => {
  console.table(results);
});
```

#### Test Event module only:
```typescript
this.diagnostics.testEventEndpoints().subscribe(results => {
  console.table(results);
});
```

#### Check if backend is running:
```typescript
this.diagnostics.isBackendRunning().subscribe(isRunning => {
  console.log('Backend running:', isRunning);
});
```

---

## Known Issues Still Needing Frontend Integration

### ⚠️ CRITICAL: Components Use Static Mock Data

The following components display hardcoded data instead of fetching from backend:

**Files requiring updates:**
- `src/app/features/credit/my-loans/my-loans.ts`
- `src/app/features/credit/loan-apply/loan-apply.ts`
- `src/app/features/credit/loan-detail/loan-detail.ts`
- `src/app/features/credit/active-contract/active-contract.ts`
- `src/app/features/credit/application-status/application-status.ts`

**What needs to be done:**
Each component should:
1. Inject the `Credit` service
2. Call appropriate methods on component init
3. Handle loading and error states
4. Display fetched data instead of static values

**Example implementation:**
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Credit } from '../../../services/credit/credit.service';
import { RequestLoanDto } from '../../../models/credit.model';

@Component({
  selector: 'app-my-loans',
  standalone: false,
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css',
})
export class MyLoans implements OnInit {
  private creditService = inject(Credit);
  
  loanRequests: RequestLoanDto[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.creditService.getRequestLoans().subscribe({
      next: (response) => {
        this.loanRequests = response.content;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
```

---

## Environment Configuration

**Current setup:**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api',
  apiEndpoints: {
    auth: '/auth',
    credit: '/credit/request-loans',
    event: '/event',
    insurance: '/insurance',
    repayment: '/repayment',
    user: '/user',
    vehicle: '/vehicle',
    wallet: '/wallet',
    score: '/score'
  }
};
```

**To change backend URL:**
Edit `src/environments/environment.ts` and update `apiBaseUrl` to your backend server.

---

## Troubleshooting Checklist

### Backend Not Responding?

1. ✅ Check if backend is running:
   ```bash
   # Check if port 8081 is responding
   curl http://localhost:8081/api/health
   ```

2. ✅ Verify environment configuration:
   ```typescript
   console.log('Backend URL:', environment.apiBaseUrl);
   ```

3. ✅ Check browser console for errors (F12)

4. ✅ Look for CORS errors (check backend CORS configuration)

5. ✅ Run diagnostics in console:
   ```javascript
   // Angular app must be loaded first
   ng.probe(document.body).injector.get('BackendDiagnosticsService')
     .testAllEndpoints().subscribe(report => console.table(report));
   ```

### Components Not Showing Data?

1. ✅ Check if component calls service in ngOnInit
2. ✅ Verify service methods use correct endpoints
3. ✅ Check browser Network tab for API calls
4. ✅ Look for errors in console (F12)
5. ✅ Verify response data matches component expectations

### Test Failures?

1. ✅ Fix import in test file (already done for credit.service.spec.ts)
2. ✅ Mock HTTP calls properly in tests
3. ✅ Run tests: `ng test`

---

## Next Steps

### IMMEDIATE (Do this first):
1. [ ] Verify backend is running on `http://localhost:8081`
2. [ ] Run `ng serve` and check console (F12) for any errors
3. [ ] Run diagnostics to verify all endpoints work
4. [ ] Check Network tab to see API calls

### SHORT-TERM:
1. [ ] Update credit components to fetch live data
2. [ ] Update event components to use live data
3. [ ] Test all CRUD operations (Create, Read, Update, Delete)
4. [ ] Test error scenarios (network down, invalid input, etc.)

### BEST PRACTICES:
1. [ ] Add loading spinners to components
2. [ ] Add error messages to UI
3. [ ] Implement retry logic for failed requests
4. [ ] Add pagination handling
5. [ ] Implement caching where appropriate
6. [ ] Add request timeout configuration

---

## Files Modified in This Diagnostic

### Deleted:
- ❌ `src/app/services/credit/credit.ts`

### Created:
- ✅ `src/app/services/backend-diagnostics.service.ts`
- ✅ `src/app/services/auth/http-logging.interceptor.ts`

### Updated:
- ✅ `src/app/app-module.ts`
- ✅ `src/app/layout/backoffice/backoffice.component.ts`
- ✅ `src/app/services/credit/credit.service.ts`
- ✅ `src/app/services/credit/credit.service.spec.ts`
- ✅ `src/app/services/event.service.ts`

---

## Support

For issues:
1. Check browser console (F12) for error messages
2. Run diagnostics (`testAllEndpoints()`)
3. Check backend logs for errors
4. Verify environment configuration
5. Ensure backend API endpoints match configuration
