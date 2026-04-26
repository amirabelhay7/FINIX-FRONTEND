import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { LoanRequestsList } from './loan-requests-list/loan-requests-list';
import { ContractsList } from './contracts-list/contracts-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'requests', component: LoanRequestsList },
  { path: 'contracts', component: ContractsList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditCenterRoutingModule { }
