import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Schedule } from './schedule/schedule';
import { PaymentHistory } from './payment-history/payment-history';
import { Delinquency } from './delinquency/delinquency';
import { PaymentDetail } from './payment-detail/payment-detail';

const routes: Routes = [
  { path: '', redirectTo: 'schedule', pathMatch: 'full' },
  { path: 'schedule', component: Schedule },
  { path: 'history', component: PaymentHistory },
  { path: 'history/:id', component: PaymentDetail },
  { path: 'delinquency', component: Delinquency }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepaymentRoutingModule { }
