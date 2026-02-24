import { Component } from '@angular/core';

/**
 * ViewModel: listing form (MVVM).
 */
@Component({
  selector: 'app-listing-form',
  standalone: false,
  templateUrl: './listing-form.html',
  styleUrl: './listing-form.css',
})
export class ListingForm {
  readonly pageTitle = 'Listing';
  readonly pageSubtitle = 'Add or edit a vehicle listing.';
  readonly backRoute = '/seller/listings';
  readonly titleLabel = 'Title';
  readonly titlePlaceholder = 'e.g. Peugeot 208';
  readonly priceLabel = 'Price (TND)';
  readonly pricePlaceholder = '18500';
  readonly yearLabel = 'Year';
  readonly yearPlaceholder = '2020';
  readonly descriptionLabel = 'Description';
  readonly descriptionPlaceholder = 'Vehicle description...';
  readonly saveLabel = 'Save';
  readonly cancelLabel = 'Cancel';
}
