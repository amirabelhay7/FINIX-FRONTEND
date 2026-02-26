import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Credit } from './credit';
import { CreditRoutingModule } from './credit-routing.module';

@NgModule({
  declarations: [Credit],
  imports: [CommonModule, CreditRoutingModule],
})
export class CreditModule {}

