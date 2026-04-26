import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, forkJoin, catchError, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EndpointTest {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  statusCode?: number;
  message?: string;
  responseTime?: number;
}

export interface DiagnosticReport {
  timestamp: string;
  apiBaseUrl: string;
  backendRunning: boolean;
  endpoints: EndpointTest[];
  summary: {
    totalEndpoints: number;
    successCount: number;
    errorCount: number;
  };
}

/**
 * Backend Diagnostics Service
 * Provides utilities to test backend connectivity and endpoint availability
 * Use this to verify all endpoints are working correctly
 */
@Injectable({
  providedIn: 'root',
})
export class BackendDiagnosticsService {
  constructor(private http: HttpClient) {}

  /**
   * Test all configured backend endpoints
   */
  testAllEndpoints(): Observable<DiagnosticReport> {
    const endpoints = Object.entries(environment.apiEndpoints).map(([key, path]) => ({
      key,
      path,
      fullUrl: `${environment.apiBaseUrl}${path}`,
    }));

    const tests: Observable<EndpointTest>[] = endpoints.map(ep =>
      this.testEndpoint(ep.fullUrl, ep.key)
    );

    return forkJoin(tests).pipe(
      tap((results: EndpointTest[]) => {
        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        
        console.log('📊 Backend Diagnostics Report:');
        console.log(`API Base URL: ${environment.apiBaseUrl}`);
        console.log(`Total Endpoints: ${results.length}`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.table(results);
      }),
      map((results: EndpointTest[]): DiagnosticReport => {
        const successCount = results.filter(r => r.status === 'success').length;
        const errorCount = results.filter(r => r.status === 'error').length;
        return {
          timestamp: new Date().toISOString(),
          apiBaseUrl: environment.apiBaseUrl,
          backendRunning: successCount > 0,
          endpoints: results,
          summary: {
            totalEndpoints: results.length,
            successCount,
            errorCount,
          },
        };
      }),
      catchError(err => {
        console.error('❌ Diagnostics failed:', err);
        return of(this.createErrorReport());
      })
    );
  }

  /**
   * Test a specific endpoint
   */
  testEndpoint(url: string, name: string): Observable<EndpointTest> {
    const startTime = performance.now();
    
    return this.http.get(url, { observe: 'response' }).pipe(
      map(response => ({
        endpoint: url,
        status: 'success' as const,
        statusCode: response.status,
        responseTime: performance.now() - startTime,
      })),
      tap(result => {
        const responseTime = performance.now() - startTime;
        console.log(`✅ ${name} (${url}): ${result.statusCode} - ${responseTime.toFixed(0)}ms`);
      }),
      catchError((error: HttpErrorResponse): Observable<EndpointTest> => {
        const responseTime = performance.now() - startTime;
        const message = error.status 
          ? `HTTP ${error.status}: ${error.statusText}` 
          : `Connection failed: ${error.message}`;
        console.log(`❌ ${name} (${url}): ${message} - ${responseTime.toFixed(0)}ms`);
        
        return of({
          endpoint: url,
          status: 'error' as const,
          statusCode: error.status || 0,
          message: message,
          responseTime: responseTime,
        } as EndpointTest);
      })
    );
  }

  /**
   * Check if backend is running
   */
  isBackendRunning(): Observable<boolean> {
    const healthUrl = `${environment.apiBaseUrl}/health`;
    return this.http.get(healthUrl, { observe: 'response' }).pipe(
      tap(() => console.log('✅ Backend is running')),
      map(() => true),
      catchError(() => {
        console.log('❌ Backend appears to be down');
        return of(false);
      })
    );
  }

  /**
   * Test Credit module endpoints
   */
  testCreditEndpoints(): Observable<EndpointTest[]> {
    const creditUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.credit}`;
    const endpoints = [
      { url: creditUrl, name: 'GET: List all request loans' },
      { url: `${creditUrl}?userId=1`, name: 'GET: Filter by user' },
    ];

    return forkJoin(
      endpoints.map(ep => this.testEndpoint(ep.url, ep.name))
    );
  }

  /**
   * Test Event module endpoints
   */
  testEventEndpoints(): Observable<EndpointTest[]> {
    const eventUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.event}`;
    const endpoints = [
      { url: `${eventUrl}/events`, name: 'GET: List all events' },
      { url: `${eventUrl}/registrations`, name: 'GET: List event registrations' },
    ];

    return forkJoin(
      endpoints.map(ep => this.testEndpoint(ep.url, ep.name))
    );
  }

  private createErrorReport(): DiagnosticReport {
    return {
      timestamp: new Date().toISOString(),
      apiBaseUrl: environment.apiBaseUrl,
      backendRunning: false,
      endpoints: [],
      summary: {
        totalEndpoints: 0,
        successCount: 0,
        errorCount: 0,
      },
    };
  }
}
