import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { Spinner } from './shared/components/spinner/spinner';
import { Alert } from './shared/components/alert/alert';
import { Button } from './shared/components/button/button';
import { Modal } from './shared/components/modal/modal';
import { SidebarComponent } from './layout/backoffice/components/sidebar/sidebar';
import {TopbarComponent} from './layout/backoffice/components/topbar/topbar.component';
import {FormsModule} from '@angular/forms';
import {BackofficeComponent} from './layout/backoffice/backoffice/backoffice.component';



@NgModule({
  declarations: [
    App,
    //Backoffice,
    AgentLayout,
    SellerLayout,
    Spinner,
    Alert,
    Button,
    Modal,
    SidebarComponent,
    BackofficeComponent,
    TopbarComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,


  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
