import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyVehicles } from './my-vehicles/my-vehicles';
import { VehicleDetail } from './vehicle-detail/vehicle-detail';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: MyVehicles },
  { path: 'vehicle/:id', component: VehicleDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
