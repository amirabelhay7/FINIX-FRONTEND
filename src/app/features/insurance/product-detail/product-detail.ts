import { Component } from '@angular/core';

/**
 * ViewModel: product detail (MVVM).
 */
@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  readonly pageTitle = 'Micro-health basic';
  readonly pageSubtitle = 'Health insurance product';
  readonly backRoute = '/insurance/products';
  readonly premiumLabel = 'Premium';
  readonly premiumValue = '50 TND / month';
  readonly coverageLabel = 'Coverage';
  readonly coverageValue = 'Medical visits, basic drugs';
  readonly descriptionLabel = 'Description';
  readonly descriptionText = 'Affordable micro-health coverage for routine care and essential prescriptions.';
  readonly getQuoteLabel = 'Get a quote';
  readonly getQuoteRoute = '/insurance/quote';
  readonly backToProductsLabel = 'Back to products';
}
