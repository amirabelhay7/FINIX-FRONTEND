import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AppLayout } from './layout/backoffice/backoffice';
import { FrontLayout } from './layout/frontoffice/front-layout';
import { Sidebar } from './layout/sidebar/sidebar';
import { Topbar } from './layout/topbar/topbar';
import { NotFound } from './features/not-found/not-found';
import { HomePage } from './features/frontoffice/home-page';
import { AboutPage } from './features/frontoffice/about-page';
import { ServicesPage } from './features/frontoffice/services-page';
import { PricingPage } from './features/frontoffice/pricing-page';
import { ContactPage } from './features/frontoffice/contact-page';
import { FaqPage } from './features/frontoffice/faq-page';
import { ModulesPage } from './features/frontoffice/modules-page';
import { ModuleDetailPage } from './features/frontoffice/module-detail-page';
import { VehiclesMarketplace } from './features/frontoffice/vehicles-marketplace/vehicles-marketplace';
import { VehicleDetail } from './features/frontoffice/vehicle-detail/vehicle-detail';

@NgModule({
  declarations: [
    App,
    AppLayout,
    FrontLayout,
    Sidebar,
    Topbar,
    NotFound,
    HomePage,
    AboutPage,
    ServicesPage,
    PricingPage,
    ContactPage,
    FaqPage,
    ModulesPage,
    ModuleDetailPage,
    VehiclesMarketplace,
    VehicleDetail,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}

