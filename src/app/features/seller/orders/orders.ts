import { Component } from '@angular/core';
import { SellerOrderRow } from '../../../models';

/**
 * ViewModel: seller orders (MVVM).
 */
@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  readonly pageTitle = 'Orders & contracts';
  readonly pageSubtitle = 'Credit-approved orders. Complete transfer of ownership outside app, then contract is uploaded by client.';
  readonly ordersTitle = 'Orders';

  readonly orders: SellerOrderRow[] = [
    { title: '#ORD-2025-042 · Honda PCX 150', meta: 'Client: Amadou Kone · Down payment received · Awaiting transfer of ownership', status: 'Handover pending', statusClass: 'text-amber-600 bg-amber-50' },
    { title: '#ORD-2024-189 · Piaggio Vespa', meta: 'Contract uploaded · Vehicle IMF property until loan repaid', status: 'Completed', statusClass: 'text-green-600 bg-green-50' },
  ];
}
