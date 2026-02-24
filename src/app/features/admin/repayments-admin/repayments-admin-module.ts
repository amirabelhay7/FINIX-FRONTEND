import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RepaymentsAdminRoutingModule } from './repayments-admin-routing-module';
import { List } from './list/list';
import { PaymentsList } from './payments-list/payments-list';
import { PaymentDetail } from './payment-detail/payment-detail';
import { SchedulesList } from './schedules-list/schedules-list';
import { DelinquencyList } from './delinquency-list/delinquency-list';
import { GraceList } from './grace-list/grace-list';
import { RecoveryList } from './recovery-list/recovery-list';
import { PenaltiesList } from './penalties-list/penalties-list';


@NgModule({
  declarations: [
    List,
    PaymentsList,
    PaymentDetail,
    SchedulesList,
    DelinquencyList,
    GraceList,
    RecoveryList,
    PenaltiesList
  ],
  imports: [
    CommonModule,
    RouterModule,
    RepaymentsAdminRoutingModule
  ]
})
export class RepaymentsAdminModule { }
