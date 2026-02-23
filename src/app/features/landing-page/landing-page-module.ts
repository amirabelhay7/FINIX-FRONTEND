import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingPageRoutingModule } from './landing-page-routing-module';
import { LandingPage } from './landing-page';


@NgModule({
  declarations: [
    LandingPage
  ],
  imports: [
    CommonModule,
    LandingPageRoutingModule
  ],
  exports: [
    LandingPage
  ]
})
export class LandingPageModule { }
