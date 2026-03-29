import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { WalletList } from './wallet-list/wallet-list';
import { WalletDetail } from './wallet-detail/wallet-detail';
import { TransactionList } from './transaction-list/transaction-list';
import { TransactionDetail } from './transaction-detail/transaction-detail';

const routes: Routes = [
  { path: '', component: List },
  { path: 'wallets', component: WalletList },
  { path: 'wallets/:id', component: WalletDetail },
  { path: 'transactions', component: TransactionList },
  { path: 'transactions/:id', component: TransactionDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletAdminRoutingModule { }
