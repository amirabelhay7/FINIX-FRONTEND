import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  DashboardKpi,
  OrderRow,
  TrafficPoint,
} from '../../core/mock-data/dashboard.mock';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  kpis: DashboardKpi[] = [];
  traffic: TrafficPoint[] = [];
  orders: OrderRow[] = [];
  activeTab: 'orders' | 'profit' = 'orders';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getKpis().subscribe((kpis) => (this.kpis = kpis));
    this.dashboardService.getTraffic().subscribe((traffic) => (this.traffic = traffic));
    this.dashboardService.getOrders().subscribe((orders) => (this.orders = orders));
  }

  setTab(tab: 'orders' | 'profit'): void {
    this.activeTab = tab;
  }
}

