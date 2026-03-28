import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import ApexCharts Module
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule
  ],
  providers: [],
  exports: [
    NgApexchartsModule
  ]
})
export class AnalyticsModule { }
