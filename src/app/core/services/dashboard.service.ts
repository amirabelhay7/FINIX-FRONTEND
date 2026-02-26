import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DASHBOARD_KPIS,
  DASHBOARD_TRAFFIC,
  DASHBOARD_ORDERS,
  DashboardKpi,
  TrafficPoint,
  OrderRow,
} from '../mock-data/dashboard.mock';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  getKpis(): Observable<DashboardKpi[]> {
    return of(DASHBOARD_KPIS);
  }

  getTraffic(): Observable<TrafficPoint[]> {
    return of(DASHBOARD_TRAFFIC);
  }

  getOrders(): Observable<OrderRow[]> {
    return of(DASHBOARD_ORDERS);
  }
}

