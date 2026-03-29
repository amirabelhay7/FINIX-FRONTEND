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
import { CampaignsListComponent } from '../../frontoffice/campaigns-list/campaigns-list';
import { CampaignDetailComponent } from '../../frontoffice/campaign-detail/campaign-detail';

const routes: Routes = [
  { path: 'dashboard', component: ClientDashboard },
  { path: 'credits', component: ClientCredits },
  { path: 'repayments', component: ClientRepayments },
  { path: 'vehicles', component: ClientVehicles },
  { path: 'insurance', component: ClientInsurance },
  { path: 'wallet', component: ClientWallet },
  { path: 'score', component: ClientScore },
  { path: 'documents', component: ClientDocuments },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'campaigns',     component: CampaignsListComponent },
{ path: 'campaigns/:id', component: CampaignDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
