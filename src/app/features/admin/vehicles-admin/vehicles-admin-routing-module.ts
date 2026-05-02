import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { VehiclesList } from './vehicles-list/vehicles-list';
import { DeliveriesList } from './deliveries-list/deliveries-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'vehicles', component: VehiclesList },
  { path: 'deliveries', component: DeliveriesList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesAdminRoutingModule { }
