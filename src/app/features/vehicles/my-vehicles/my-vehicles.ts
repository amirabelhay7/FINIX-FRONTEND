import { Component } from '@angular/core';
import { VehicleListItem } from '../../../models';

/**
 * ViewModel: my vehicles (MVVM).
 */
@Component({
  selector: 'app-my-vehicles',
  standalone: false,
  templateUrl: './my-vehicles.html',
  styleUrl: './my-vehicles.css',
})
export class MyVehicles {
  readonly pageTitle = 'My Vehicles';
  readonly pageSubtitle = 'Vehicles registered as collateral for your loans.';
  readonly collateralInfoTitle = 'Collateral';
  readonly collateralInfoText = "Vehicles linked to your active loans appear here. Documents and delivery status are available in each vehicle's detail page.";

  readonly vehicles: VehicleListItem[] = [
    { id: 1, name: 'Honda PCX 150 · 8,450 TND', subtitlePrefix: 'VIN ****3921 · Collateral #FIN-2025-0842 · ', status: 'Delivered', statusClass: 'text-green-600 font-semibold', route: '/vehicles/vehicle/1', icon: 'two_wheeler', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
    { id: 2, name: 'Peugeot 208 · 42,000 TND', subtitlePrefix: 'VIN ****7782 · Contract #FIN-2026-0102 · ', status: 'Pending delivery', statusClass: 'text-amber-600 font-semibold', route: '/vehicles/vehicle/2', icon: 'directions_car', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
    { id: 3, name: 'Yamaha NMAX 155 · 6,200 TND', subtitlePrefix: 'VIN ****2109 · Contract #FIN-2023-4521 · ', status: 'Loan closed', statusClass: 'text-gray-500 font-medium', route: '/vehicles/vehicle/3', icon: 'two_wheeler', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-500' },
  ];
}
