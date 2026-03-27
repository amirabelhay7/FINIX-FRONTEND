import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientRoutingModule } from './client-routing-module';
import { ClientDashboard } from './dashboard/dashboard';
import { ClientCredits } from './credits/credits';
import { ClientRepayments } from './repayments/repayments';
import { ClientVehicles } from './vehicles/vehicles';
import { ClientInsurance } from './insurance/insurance';
import { ClientWallet } from './wallet/wallet';
import { ClientScore } from './score/score';
import { ClientDocuments } from './documents/documents';

@NgModule({
  declarations: [
    ClientDashboard, ClientCredits, ClientRepayments, ClientVehicles,
    ClientInsurance, ClientWallet, ClientScore, ClientDocuments,
  ],
  imports: [CommonModule, FormsModule, ClientRoutingModule],
})
export class ClientModule {}
