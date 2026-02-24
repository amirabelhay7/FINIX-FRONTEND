import { Component } from '@angular/core';

/**
 * ViewModel: order detail (MVVM).
 */
@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail {
  readonly pageTitle = 'Order #1';
  readonly pageSubtitle = 'Vehicle credit order — Peugeot 208';
  readonly backRoute = '/seller/orders';
  readonly clientLabel = 'Client';
  readonly clientValue = 'Amadou Kone';
  readonly listingLabel = 'Listing';
  readonly listingValue = 'Peugeot 208 — 18,500 TND';
  readonly statusLabel = 'Status';
  readonly statusValue = 'Pending delivery';
  readonly statusClass = 'bg-amber-50 text-amber-700';
  readonly orderDateLabel = 'Order date';
  readonly orderDateValue = '2025-02-18';
  readonly notesLabel = 'Notes';
  readonly notesText = 'Down payment received. Awaiting transfer of ownership paperwork.';
  readonly backLabel = 'Back to orders';
}
