import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractsList } from './contracts-list/contracts-list';

/**
 * Reusable IMF / admin explorer for GET /credit/loan-contracts.
 * Imported by CreditCenterModule (routing) and AppModule (agent layout embed).
 */
@NgModule({
  declarations: [ContractsList],
  imports: [CommonModule, RouterModule],
  exports: [ContractsList],
})
export class LoanContractsExplorerModule {}
