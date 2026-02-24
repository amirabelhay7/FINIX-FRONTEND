import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AgentRoutingModule } from './agent-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { Clients } from './clients/clients';
import { TopUp } from './top-up/top-up';
import { LoanVerification } from './loan-verification/loan-verification';
import { ClientDetail } from './client-detail/client-detail';


@NgModule({
  declarations: [
    Dashboard,
    Clients,
    TopUp,
    LoanVerification,
    ClientDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    AgentRoutingModule
  ]
})
export class AgentModule { }
