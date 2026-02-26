import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Repayment } from './repayment';
import { RepaymentRoutingModule } from './repayment-routing.module';

@NgModule({
  declarations: [Repayment],
  imports: [CommonModule, RepaymentRoutingModule],
})
export class RepaymentModule {}

