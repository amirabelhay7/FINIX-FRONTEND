import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RepaymentsAdminRoutingModule } from './repayments-admin-routing-module';
import { List } from './list/list';
import { PaymentsList } from './payments-list/payments-list';
import { PaymentDetail } from './payment-detail/payment-detail';
import { SchedulesList } from './schedules-list/schedules-list';
import { DelinquencyList } from './delinquency-list/delinquency-list';
import { DelinquencyDetail } from './delinquency-detail/delinquency-detail';
import { GraceList } from './grace-list/grace-list';
import { RecoveryList } from './recovery-list/recovery-list';
import { PenaltiesList } from './penalties-list/penalties-list';
import { RiskScore } from './risk-score/risk-score';


@NgModule({
  declarations: [
    List,
    PaymentsList,
    PaymentDetail,
    SchedulesList,
    DelinquencyList,
    DelinquencyDetail,
    GraceList,
    RecoveryList,
    PenaltiesList,
    RiskScore,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RepaymentsAdminRoutingModule
  ]
})
export class RepaymentsAdminModule { }
