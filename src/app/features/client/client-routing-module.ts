import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboard } from './dashboard/dashboard';
import { ClientCredits } from './credits/credits';
import { ClientRepayments } from './repayments/repayments';
import { ClientVehicles } from './vehicles/vehicles';
import { ClientInsurance } from './insurance/insurance';
import { ClientWallet } from './wallet/wallet';
import { ClientScore } from './score/score';
import { ClientDocuments } from './documents/documents';

const routes: Routes = [
  { path: 'dashboard', component: ClientDashboard },
  { path: 'credits', component: ClientCredits },
  { path: 'repayments', component: ClientRepayments },
  { path: 'vehicles', component: ClientVehicles },
  { path: 'insurance', component: ClientInsurance },
  { path: 'wallet', loadChildren: () => import('../wallet/wallet-module').then(m => m.WalletModule) },
  { path: 'score', component: ClientScore },
  { path: 'documents', component: ClientDocuments },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
