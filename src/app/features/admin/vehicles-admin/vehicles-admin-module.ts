import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VehiclesAdminRoutingModule } from './vehicles-admin-routing-module';
import { List } from './list/list';
import { VehiclesList } from './vehicles-list/vehicles-list';
import { DeliveriesList } from './deliveries-list/deliveries-list';


@NgModule({
  declarations: [
    List,
    VehiclesList,
    DeliveriesList
  ],
  imports: [
    CommonModule,
    RouterModule,
    VehiclesAdminRoutingModule
  ]
})
export class VehiclesAdminModule { }
