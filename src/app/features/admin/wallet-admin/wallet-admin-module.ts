import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    WalletAdminRoutingModule
  ]
})
export class WalletAdminModule { }
