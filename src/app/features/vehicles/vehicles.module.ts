import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Vehicles } from './vehicles';
import { VehiclesList } from './vehicles-list/vehicles-list';
import { VehicleForm } from './vehicle-form/vehicle-form';
import { VehicleAdminDetail } from './vehicle-admin-detail/vehicle-admin-detail';
import { VehiclesRoutingModule } from './vehicles-routing.module';

@NgModule({
  declarations: [
    Vehicles,
    VehiclesList,
    VehicleForm,
    VehicleAdminDetail,
  ],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, VehiclesRoutingModule],
})
export class VehiclesModule {}

