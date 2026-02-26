import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Repayment } from './repayment';

const routes: Routes = [{ path: '', component: Repayment }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepaymentRoutingModule {}

