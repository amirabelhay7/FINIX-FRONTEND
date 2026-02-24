import { Component } from '@angular/core';
import { VehicleDetailItem, VehicleDocumentRow } from '../../../models';

/**
 * ViewModel: vehicle detail (MVVM).
 */
@Component({
  selector: 'app-vehicle-detail',
  standalone: false,
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetail {
  readonly pageTitle = 'Honda PCX 150';
  readonly pageSubtitle = 'VIN ****3921 · Collateral for Contract #FIN-2025-0842';
  readonly backRoute = '/vehicles/list';
  readonly vehicleInfoTitle = 'Vehicle info';
  readonly deliveryTitle = 'Delivery';
  readonly deliveryText = 'Vehicle delivered on Jan 10, 2025. GPS tracking active.';
  readonly documentsTitle = 'Documents';
  readonly downloadLabel = 'Download';

  readonly infoItems: VehicleDetailItem[] = [
    { label: 'Model', value: 'Honda PCX 150' },
    { label: 'VIN', value: '****3921', valueClass: 'font-mono' },
    { label: 'Status', value: 'Active', valueClass: 'text-green-600' },
    { label: 'Linked contract', value: '#FIN-2025-0842' },
  ];

  readonly documents: VehicleDocumentRow[] = [
    { title: 'Registration certificate.pdf', uploadedAt: 'Uploaded Jan 10, 2025' },
  ];
}
