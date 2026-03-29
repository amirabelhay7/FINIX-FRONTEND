import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AgentRoutingModule } from './agent-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { Clients } from './clients/clients';
import { TopUp } from './top-up/top-up';
import { TopUpEnhanced } from './top-up/top-up-enhanced';
import { LoanVerification } from './loan-verification/loan-verification';
import { ClientDetail } from './client-detail/client-detail';
import { AgentStubComponent } from './agent-stub/agent-stub';


@NgModule({
  declarations: [
    Dashboard,
    Clients,
    TopUp,
    TopUpEnhanced,
    LoanVerification,
    ClientDetail,
    AgentStubComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AgentRoutingModule
  ]
})
export class AgentModule { }
