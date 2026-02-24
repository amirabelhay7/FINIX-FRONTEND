import { Component } from '@angular/core';
import { AdminVehicleRow } from '../../../../models';

/**
 * ViewModel: admin vehicles list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-vehicles-list',
  standalone: false,
  templateUrl: './vehicles-list.html',
  styleUrl: './vehicles-list.css',
})
export class VehiclesList {
  readonly pageTitle = 'Vehicles';
  readonly pageSubtitle = 'Financed vehicles (IMF property until repaid).';
  readonly backRoute = '/admin/vehicles';

  readonly rows: AdminVehicleRow[] = [
    { id: 1, makeModel: 'Peugeot 208', vin: 'VF3...', status: 'FINANCED', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/vehicles/vehicles/1' },
  ];
}
