import { Component } from '@angular/core';
import { SellerListingRow } from '../../../models';

/**
 * ViewModel: seller listings (MVVM).
 */
@Component({
  selector: 'app-listings',
  standalone: false,
  templateUrl: './listings.html',
  styleUrl: './listings.css',
})
export class Listings {
  readonly pageTitle = 'My listings';
  readonly pageSubtitle = 'Vehicles offered for FINIX-backed credit.';
  readonly addVehicleLabel = 'Add vehicle';
  readonly vehiclesTitle = 'Vehicles';

  readonly listings: SellerListingRow[] = [
    { name: 'Honda PCX 150', meta: '5,000 TND · Listed Jan 5, 2025 · Reserved for #ORD-2025-042', status: 'Reserved', statusClass: 'text-amber-600 bg-amber-50' },
    { name: 'Yamaha NMAX', meta: '6,200 TND · Listed Jan 12, 2025', status: 'Available', statusClass: 'text-green-600 bg-green-50' },
  ];
}
