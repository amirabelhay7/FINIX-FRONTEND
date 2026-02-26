import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Insurance } from './insurance';
import { InsuranceRoutingModule } from './insurance-routing.module';

@NgModule({
  declarations: [Insurance],
  imports: [CommonModule, InsuranceRoutingModule],
})
export class InsuranceModule {}

