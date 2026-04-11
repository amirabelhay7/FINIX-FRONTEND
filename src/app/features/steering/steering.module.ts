import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialSteeringChartsComponent } from './financial-steering-charts/financial-steering-charts.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FinancialSteeringChartsComponent,
  ],
  exports: [
    FinancialSteeringChartsComponent,
  ],
  providers: [DecimalPipe]
})
export class SteeringModule {}
