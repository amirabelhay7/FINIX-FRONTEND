import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SteeringAdminRoutingModule } from './steering-admin-routing-module';
import { List } from './list/list';
import { TreasuryList } from './treasury-list/treasury-list';
import { IndicatorsList } from './indicators-list/indicators-list';
import { SimulationsList } from './simulations-list/simulations-list';


@NgModule({
  declarations: [
    List,
    TreasuryList,
    IndicatorsList,
    SimulationsList
  ],
  imports: [
    CommonModule,
    RouterModule,
    SteeringAdminRoutingModule
  ]
})
export class SteeringAdminModule { }
