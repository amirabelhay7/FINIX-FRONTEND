import { Component } from '@angular/core';
import { InsuranceOption } from '../../../models';

/**
 * ViewModel: get a quote (MVVM).
 */
@Component({
  selector: 'app-quote',
  standalone: false,
  templateUrl: './quote.html',
  styleUrl: './quote.css',
})
export class Quote {
  readonly pageTitle = 'Get a Quote';
  readonly pageSubtitle = 'Simulate coverage and see your premium.';
  readonly backRoute = '/insurance/products';
  readonly productLabel = 'Product';
  readonly coverageLabel = 'Coverage amount (TND)';
  readonly coveragePlaceholder = 'e.g. 2000';
  readonly durationLabel = 'Duration';
  readonly calculateLabel = 'Calculate quote';
  readonly estimatedLabel = 'Estimated premium';
  readonly estimatedAmount = '96 TND';
  readonly estimatedUnit = '/ year';
  readonly estimatedNote = '8 TND/month · Moto Cover, 2,000 TND coverage, 12 months.';

  readonly products: InsuranceOption[] = [
    { value: 'moto', label: 'Moto Cover' },
    { value: 'health', label: 'Health Micro' },
    { value: 'home', label: 'Home Shield' },
  ];

  readonly durationOptions: InsuranceOption[] = [
    { value: '6', label: '6 months' },
    { value: '12', label: '12 months' },
    { value: '24', label: '24 months' },
  ];
}
