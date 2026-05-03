import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { PaymentsList } from './payments-list/payments-list';
import { PaymentDetail } from './payment-detail/payment-detail';
import { SchedulesList } from './schedules-list/schedules-list';
import { DelinquencyList } from './delinquency-list/delinquency-list';
import { GraceList } from './grace-list/grace-list';
import { RecoveryList } from './recovery-list/recovery-list';
import { PenaltiesList } from './penalties-list/penalties-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'payments', component: PaymentsList },
  { path: 'payments/:id', component: PaymentDetail },
  { path: 'schedules', component: SchedulesList },
  { path: 'delinquency', component: DelinquencyList },
  { path: 'grace', component: GraceList },
  { path: 'recovery', component: RecoveryList },
  { path: 'penalties', component: PenaltiesList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepaymentsAdminRoutingModule { }
