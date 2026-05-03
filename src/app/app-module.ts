import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthModule } from './features/auth/auth-module';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { SharedModule } from './shared/shared-module';
import { SidebarComponent } from './layout/backoffice/components/sidebar/sidebar';
import { TopbarComponent } from './layout/backoffice/components/topbar/topbar.component';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { authInterceptor } from './services/auth/auth.interceptor';
import { httpLoggingInterceptor } from './services/auth/http-logging.interceptor';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';
import { LoanContractsExplorerModule } from './features/admin/credit-center/loan-contracts-explorer.module';

@NgModule({
  declarations: [
    App,
    AgentLayout,
    SellerLayout,
    SidebarComponent,
    BackofficeComponent,
    TopbarComponent,
    UnauthorizedComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    SharedModule,
    LoanContractsExplorerModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([httpLoggingInterceptor, authInterceptor])),
  ],
  bootstrap: [App]
})
export class AppModule { }
