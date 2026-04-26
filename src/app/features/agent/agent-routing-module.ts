import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Clients } from './clients/clients';
import { TopUp } from './top-up/top-up';
import { LoanVerification } from './loan-verification/loan-verification';
import { ClientDetail } from './client-detail/client-detail';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'clients', component: Clients },
  { path: 'clients/:id', component: ClientDetail },
  { path: 'top-up', component: TopUp },
  { path: 'loan-verification', component: LoanVerification }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule { }
