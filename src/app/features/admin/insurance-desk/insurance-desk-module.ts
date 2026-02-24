import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InsuranceDeskRoutingModule } from './insurance-desk-routing-module';
import { List } from './list/list';
import { ProductsList } from './products-list/products-list';
import { PoliciesList } from './policies-list/policies-list';
import { ClaimsList } from './claims-list/claims-list';


@NgModule({
  declarations: [
    List,
    ProductsList,
    PoliciesList,
    ClaimsList
  ],
  imports: [
    CommonModule,
    RouterModule,
    InsuranceDeskRoutingModule
  ]
})
export class InsuranceDeskModule { }
