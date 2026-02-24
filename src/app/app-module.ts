import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Backoffice } from './layout/backoffice/backoffice';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';

@NgModule({
  declarations: [
    App,
    Backoffice,
    AgentLayout,
    SellerLayout,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
