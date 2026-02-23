import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Backoffice } from './layout/backoffice/backoffice';
import { Frontoffice } from './layout/frontoffice/frontoffice';

@NgModule({
  declarations: [
    App,
    Backoffice,
    Frontoffice,
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
