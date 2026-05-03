import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WalletHome } from './wallet-home/wallet-home';
import { Transfer } from './transfer/transfer';
import { Transactions } from './transactions/transactions';
import { Deposit } from './deposit/deposit';
import { Withdraw } from './withdraw/withdraw';
import { AgentTopUp } from './agent-top-up/agent-top-up';
import { TransactionDetail } from './transaction-detail/transaction-detail';

const routes: Routes = [
  { path: '', component: WalletHome },
  { path: 'deposit', component: Deposit },
  { path: 'withdraw', component: Withdraw },
  { path: 'agent-top-up', component: AgentTopUp },
  { path: 'transfer', component: Transfer },
  { path: 'transactions', component: Transactions },
  { path: 'transactions/:id', component: TransactionDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
