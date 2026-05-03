import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboard } from './dashboard/dashboard';
import { ClientCredits } from './credits/credits';
import { ClientRepayments } from './repayments/repayments';
import { ClientVehiclesShell } from './vehicles/client-vehicles-shell';
import { ClientVehicleCatalog } from './vehicles/client-vehicle-catalog/client-vehicle-catalog';
import { ClientVehicleDetail } from './vehicles/client-vehicle-detail/client-vehicle-detail';
import { ClientMyReservations } from './vehicles/client-my-reservations/client-my-reservations';
import { ClientFeedbackPage } from './vehicles/client-feedback-page/client-feedback-page';
import { ClientInsurance } from './insurance/insurance';
import { ClientWallet } from './wallet/wallet';
import { ClientScore } from './score/score';
import { ClientDocuments } from './documents/documents';
import { UserProfileComponent } from './user-profile/user-profile';
import { ClientEvents } from './events/events';
import { ClientGroupChat } from './group-chat/group-chat';

const routes: Routes = [
  { path: 'dashboard', component: ClientDashboard },
  { path: 'credits', component: ClientCredits },
  { path: 'repayments', component: ClientRepayments },
  {
    path: 'vehicles',
    component: ClientVehiclesShell,
    children: [
      { path: '', component: ClientVehicleCatalog },
      { path: 'suivi', component: ClientMyReservations },
      { path: 'feedback', component: ClientFeedbackPage },
      { path: ':id', component: ClientVehicleDetail },
    ],
  },
  { path: 'events', component: ClientEvents },
  { path: 'group-chat', component: ClientGroupChat },
  { path: 'insurance', component: ClientInsurance },
  { path: 'wallet', component: ClientWallet },
  { path: 'score', component: ClientScore },
  { path: 'documents', component: ClientDocuments },
  { path: 'users/me', component: UserProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
