import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CreditCenterRoutingModule } from './credit-center-routing-module';
import { List } from './list/list';
import { LoanRequestsList } from './loan-requests-list/loan-requests-list';
import { LoanContractsExplorerModule } from './loan-contracts-explorer.module';

@NgModule({
  declarations: [List, LoanRequestsList],
  imports: [
    CommonModule,
    RouterModule,
    LoanContractsExplorerModule,
    CreditCenterRoutingModule,
  ],
})
export class CreditCenterModule {}
