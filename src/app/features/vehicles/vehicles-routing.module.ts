import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesList } from './vehicles-list/vehicles-list';
import { VehicleForm } from './vehicle-form/vehicle-form';
import { VehicleAdminDetail } from './vehicle-admin-detail/vehicle-admin-detail';

const routes: Routes = [
  { path: '', component: VehiclesList },
  { path: 'new', component: VehicleForm },
  { path: ':id', component: VehicleAdminDetail },
  { path: ':id/edit', component: VehicleForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehiclesRoutingModule {}

