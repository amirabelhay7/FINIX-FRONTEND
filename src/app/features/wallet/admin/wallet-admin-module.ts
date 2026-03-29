import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { WalletAdminRoutingModule } from './wallet-admin-routing-module';
import { List } from './list/list';
import { WalletList } from './wallet-list/wallet-list';
import { WalletDetail } from './wallet-detail/wallet-detail';
import { TransactionList } from './transaction-list/transaction-list';
import { TransactionDetail } from './transaction-detail/transaction-detail';


@NgModule({
  declarations: [
    List,
    WalletList,
    WalletDetail,
    TransactionList,
    TransactionDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    WalletAdminRoutingModule
  ]
})
export class WalletAdminModule { }
