import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CreditCenterRoutingModule } from './credit-center-routing-module';
import { List } from './list/list';
import { LoanRequestsList } from './loan-requests-list/loan-requests-list';
import { ContractsList } from './contracts-list/contracts-list';


@NgModule({
  declarations: [
    List,
    LoanRequestsList,
    ContractsList
  ],
  imports: [
    CommonModule,
    RouterModule,
    CreditCenterRoutingModule
  ]
})
export class CreditCenterModule { }
