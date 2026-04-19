import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { SharedModule } from './shared/shared-module';
import { AuthModule } from './features/auth/auth-module';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
import { SidebarComponent } from './layout/backoffice/components/sidebar/sidebar';
import { TopbarComponent } from './layout/backoffice/components/topbar/topbar.component';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { authInterceptor } from './services/auth/auth.interceptor';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';
import { SteeringModule } from './features/steering/steering.module';
import { AdvancedIndicatorsComponent } from './features/steering/advanced-indicators/advanced-indicators.component';
import { HhiAnalyzerComponent } from './layout/backoffice/components/hhi-analyzer/hhi-analyzer.component';

@NgModule({
  declarations: [
    App,
    AgentLayout,
    SellerLayout,
    InsurerLayout,
    SidebarComponent,
    TopbarComponent,
    UnauthorizedComponent,
    BackofficeComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    SharedModule,
    AuthModule,
    SteeringModule,
    AdvancedIndicatorsComponent,
    HhiAnalyzerComponent,
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App]
})
export class AppModule {}
