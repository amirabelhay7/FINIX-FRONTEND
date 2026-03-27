import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AgentRoutingModule } from './agent-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { Clients } from './clients/clients';
import { TopUp } from './top-up/top-up';
import { LoanVerification } from './loan-verification/loan-verification';
import { ClientDetail } from './client-detail/client-detail';
import { AgentStubComponent } from './agent-stub/agent-stub';


@NgModule({
  declarations: [
    Dashboard,
    Clients,
    TopUp,
    LoanVerification,
    ClientDetail,
    AgentStubComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AgentRoutingModule
  ]
})
export class AgentModule { }
