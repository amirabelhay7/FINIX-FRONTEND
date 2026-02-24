import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CreditRoutingModule } from './credit-routing-module';
import { LoanApply } from './loan-apply/loan-apply';
import { MyLoans } from './my-loans/my-loans';
import { LoanDetail } from './loan-detail/loan-detail';
import { ActiveContract } from './active-contract/active-contract';
import { ApplicationStatus } from './application-status/application-status';
import { DownPayment } from './down-payment/down-payment';
import { UploadContract } from './upload-contract/upload-contract';


@NgModule({
  declarations: [
    LoanApply,
    MyLoans,
    LoanDetail,
    ActiveContract,
    ApplicationStatus,
    DownPayment,
    UploadContract
  ],
  imports: [
    CommonModule,
    RouterModule,
    CreditRoutingModule
  ]
})
export class CreditModule { }
