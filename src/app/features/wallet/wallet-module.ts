import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { WalletRoutingModule } from './wallet-routing-module';
import { WalletHome } from './wallet-home/wallet-home';
import { Transfer } from './transfer/transfer';
import { Transactions } from './transactions/transactions';
import { Deposit } from './deposit/deposit';
import { Withdraw } from './withdraw/withdraw';
import { AgentTopUp } from './agent-top-up/agent-top-up';
import { TransactionDetail } from './transaction-detail/transaction-detail';


@NgModule({
  declarations: [
    WalletHome,
    Transfer,
    Transactions,
    Deposit,
    Withdraw,
    AgentTopUp,
    TransactionDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }
