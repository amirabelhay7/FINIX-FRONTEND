import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import {BackofficeComponent} from './layout/backoffice/backoffice/backoffice.component';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { Dashboard } from './features/dashboard/dashboard';
const routes: Routes = [
  {
    path: '',
    component: BackofficeComponent
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
