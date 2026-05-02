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
import { SidebarComponent } from './layout/backoffice/components/sidebar/sidebar';
import { TopbarComponent } from './layout/backoffice/components/topbar/topbar.component';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { ReservationsAdminComponent } from './layout/backoffice/components/reservations-admin/reservations-admin.component';
import { authInterceptor } from './services/auth/auth.interceptor';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
  declarations: [
    App,
    AgentLayout,
    SellerLayout,
    InsurerLayout,
    SidebarComponent,
    BackofficeComponent,
    TopbarComponent,
    ReservationsAdminComponent,
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
    provideCharts(withDefaultRegisterables()),
  ],
  bootstrap: [App]
})
export class AppModule {}
