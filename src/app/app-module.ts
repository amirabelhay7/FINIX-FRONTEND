import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SharedModule } from './shared/shared-module';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
import { AgentShell } from './layout/agent-shell/agent-shell';
import { SidebarComponent } from './layout/backoffice/components/sidebar/sidebar';
import { TopbarComponent } from './layout/backoffice/components/topbar/topbar.component';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { AdminShellComponent } from './layout/admin-shell/admin-shell.component';
import { AdminClients } from './features/admin/clients/admin-clients';
import { AdminSettings } from './features/admin/settings/admin-settings';
import { authInterceptor } from './services/auth/auth.interceptor';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';

@NgModule({
  declarations: [
    App,
    AgentLayout,
    AgentShell,
    SellerLayout,
    InsurerLayout,
    AdminShellComponent,
    AdminClients,
    AdminSettings,
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
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App]
})
export class AppModule {}
