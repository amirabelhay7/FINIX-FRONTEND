import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LandingPageRoutingModule } from './landing-page-routing-module';
import { LandingPage } from './landing-page';


@NgModule({
  declarations: [
    LandingPage
  ],
  imports: [
    CommonModule,
    RouterModule,
    LandingPageRoutingModule
  ],
  exports: [
    LandingPage
  ]
})
export class LandingPageModule { }
