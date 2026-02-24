import { Component } from '@angular/core';
import { IndicatorKpi } from '../../../../models';

/**
 * ViewModel: indicators list (MVVM).
 */
@Component({
  selector: 'app-indicators-list',
  standalone: false,
  templateUrl: './indicators-list.html',
  styleUrl: './indicators-list.css',
})
export class IndicatorsList {
  readonly pageTitle = 'Indicators';
  readonly pageSubtitle = 'Key performance indicators.';
  readonly backRoute = '/admin/steering';

  readonly kpis: IndicatorKpi[] = [
    { label: 'Portfolio at risk', value: '4.2%', valueClass: 'text-[#135bec]' },
    { label: 'Disbursements (MTD)', value: '85,000 TND', valueClass: 'text-green-600' },
    { label: 'Collections (MTD)', value: '72,000 TND', valueClass: 'text-green-600' },
    { label: 'Active clients', value: '1,240' },
  ];
}
