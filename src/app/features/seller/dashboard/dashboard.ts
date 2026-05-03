import { Component } from '@angular/core';
import { SellerKpiCard, SellerOrderRow } from '../../../models';

/**
 * ViewModel: seller dashboard (MVVM).
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly pageTitle = 'Seller Dashboard';
  readonly pageSubtitle = 'Your vehicles and orders linked to FINIX credit.';
  readonly recentOrdersTitle = 'Recent orders';
  readonly viewAllLabel = 'View all';
  readonly viewAllRoute = '/seller/orders';

  readonly kpis: SellerKpiCard[] = [
    { label: 'Active listings', value: '4' },
    { label: 'Orders this month', value: '2', valueClass: 'text-[#135bec]' },
    { label: 'Pending handover', value: '1', valueClass: 'text-amber-600' },
  ];

  readonly recentOrders: SellerOrderRow[] = [
    { title: 'Honda PCX 150', meta: 'Order #ORD-2025-042 · Client approved · Awaiting transfer', status: 'Handover pending', statusClass: 'text-amber-600 bg-amber-50' },
  ];
}
