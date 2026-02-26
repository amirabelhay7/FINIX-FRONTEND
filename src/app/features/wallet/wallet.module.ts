import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wallet } from './wallet';
import { WalletRoutingModule } from './wallet-routing.module';

@NgModule({
  declarations: [Wallet],
  imports: [CommonModule, WalletRoutingModule],
})
export class WalletModule {}

