import { Component } from '@angular/core';

/**
 * ViewModel: listing detail (MVVM).
 */
@Component({
  selector: 'app-listing-detail',
  standalone: false,
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css',
})
export class ListingDetail {
  readonly pageTitle = 'Peugeot 208';
  readonly pageSubtitle = 'Listing #1';
  readonly backRoute = '/seller/listings';
  readonly editLabel = 'Edit';
  readonly editRoute = '/seller/listings/edit/1';
  readonly priceLabel = 'Price';
  readonly priceValue = '18,500 TND';
  readonly yearLabel = 'Year';
  readonly yearValue = '2020';
  readonly statusLabel = 'Status';
  readonly statusValue = 'Available';
  readonly statusClass = 'bg-green-50 text-green-700';
  readonly descriptionLabel = 'Description';
  readonly descriptionText = 'Well-maintained Peugeot 208, low mileage, full service history.';
  readonly backLabel = 'Back to listings';
}
