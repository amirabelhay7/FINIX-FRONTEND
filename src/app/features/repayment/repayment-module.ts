import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RepaymentRoutingModule } from './repayment-routing-module';
import { Schedule } from './schedule/schedule';
import { PaymentHistory } from './payment-history/payment-history';
import { Delinquency } from './delinquency/delinquency';
import { PaymentDetail } from './payment-detail/payment-detail';


@NgModule({
  declarations: [
    Schedule,
    PaymentHistory,
    Delinquency,
    PaymentDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    RepaymentRoutingModule
  ]
})
export class RepaymentModule { }
