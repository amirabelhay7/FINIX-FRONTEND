import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Wallet } from './wallet';

const routes: Routes = [{ path: '', component: Wallet }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletRoutingModule {}

