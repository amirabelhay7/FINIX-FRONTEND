import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VehiclesRoutingModule } from './vehicles-routing-module';
import { MyVehicles } from './my-vehicles/my-vehicles';
import { VehicleDetail } from './vehicle-detail/vehicle-detail';


@NgModule({
  declarations: [
    MyVehicles,
    VehicleDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    VehiclesRoutingModule
  ]
})
export class VehiclesModule { }
