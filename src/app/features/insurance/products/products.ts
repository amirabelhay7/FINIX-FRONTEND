import { Component } from '@angular/core';
import { InsuranceProduct } from '../../../models';

/**
 * ViewModel: insurance products list (MVVM).
 */
@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  readonly pageTitle = 'Insurance Products';
  readonly pageSubtitle = 'Micro-protection for you and your assets.';
  readonly whyMicroCopy = 'Low premiums (from 18 TND/month), simple terms, and fast claims. Designed for Tunisia and emerging markets. All products are offered by licensed partners.';

  readonly products: InsuranceProduct[] = [
    { id: 1, name: 'Moto Cover', description: 'Theft & damage for two-wheelers. Third-party liability included.', priceNote: 'Base rate: 2.4% · From 25 TND/month', route: '/insurance/quote', accentColor: 'bg-[#135bec]', icon: 'two_wheeler', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]', badges: [{ label: 'Popular', class: 'bg-[#135bec] text-white' }, { label: 'Recommended', class: 'bg-amber-100 text-amber-800' }] },
    { id: 2, name: 'Health Micro', description: 'Basic health coverage for individuals. Doctor visits & prescriptions.', priceNote: 'Base rate: 3.2% · From 38 TND/month', route: '/insurance/quote', accentColor: 'bg-green-500', icon: 'health_and_safety', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600', badges: [{ label: 'Recommended', class: 'bg-amber-100 text-amber-800' }] },
    { id: 3, name: 'Home Shield', description: 'Fire, theft & natural disaster for your home.', priceNote: 'Base rate: 1.8% · From 45 TND/month', route: '/insurance/quote', accentColor: 'bg-amber-500', icon: 'home', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
    { id: 4, name: 'Life Micro', description: 'Term life coverage. Payout to beneficiaries.', priceNote: 'Base rate: 1.2% · From 18 TND/month', route: '/insurance/quote', accentColor: 'bg-purple-500', icon: 'person', iconBgClass: 'bg-purple-50', iconColorClass: 'text-purple-600', badges: [{ label: 'Popular', class: 'bg-[#135bec] text-white' }] },
    { id: 5, name: 'Crop Shield', description: 'Weather & crop failure for smallholder farmers.', priceNote: 'Base rate: 4.0% · Seasonal plans', route: '/insurance/quote', accentColor: 'bg-emerald-600', icon: 'grass', iconBgClass: 'bg-emerald-50', iconColorClass: 'text-emerald-600' },
  ];
}
