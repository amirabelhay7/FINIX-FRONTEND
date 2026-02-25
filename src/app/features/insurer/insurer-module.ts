import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InsurerRoutingModule } from './insurer-routing-module';
import { InsurerDashboard } from './insurer-dashboard/insurer-dashboard';

@NgModule({
  declarations: [InsurerDashboard],
  imports: [
    CommonModule,
    RouterModule,
    InsurerRoutingModule
  ]
})
export class InsurerModule { }
