import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPage } from './landing-page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingPageRoutingModule { }
