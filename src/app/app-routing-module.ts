import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayout } from './layout/backoffice/backoffice';
import { FrontLayout } from './layout/frontoffice/front-layout';
import { AdminGuard } from './core/guards/admin.guard';
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

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  // Backoffice (admin) – sidebar layout, AdminGuard
  {
    path: 'admin',
    component: AppLayout,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule,
          ),
      },
      {
        path: 'credit',
        loadChildren: () =>
          import('./features/credit/credit.module').then((m) => m.CreditModule),
      },
      {
        path: 'scoring',
        loadChildren: () =>
          import('./features/scoring/scoring.module').then(
            (m) => m.ScoringModule,
          ),
      },
      {
        path: 'wallet',
        loadChildren: () =>
          import('./features/wallet/wallet.module').then((m) => m.WalletModule),
      },
      {
        path: 'insurance',
        loadChildren: () =>
          import('./features/insurance/insurance.module').then(
            (m) => m.InsuranceModule,
          ),
      },
      {
        path: 'repayment',
        loadChildren: () =>
          import('./features/repayment/repayment.module').then(
            (m) => m.RepaymentModule,
          ),
      },
      {
        path: 'vehicles',
        loadChildren: () =>
          import('./features/vehicles/vehicles.module').then(
            (m) => m.VehiclesModule,
          ),
      },
      { path: '**', component: NotFound },
    ],
  },
  // Front-office (public) – top navbar layout
  {
    path: '',
    component: FrontLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomePage },
      { path: 'credit', component: ModuleDetailPage, data: { slug: 'credit' } },
      { path: 'scoring', component: ModuleDetailPage, data: { slug: 'scoring' } },
      { path: 'wallet', component: ModuleDetailPage, data: { slug: 'wallet' } },
      { path: 'insurance', component: ModuleDetailPage, data: { slug: 'insurance' } },
      { path: 'repayment', component: ModuleDetailPage, data: { slug: 'repayment' } },
      { path: 'vehicles', component: VehiclesMarketplace },
      { path: 'vehicles/:id', component: VehicleDetail },
      { path: 'about', component: AboutPage },
      { path: 'contact', component: ContactPage },
      { path: 'services', component: ServicesPage },
      { path: 'pricing', component: PricingPage },
      { path: 'faq', component: FaqPage },
      { path: 'modules', component: ModulesPage },
      { path: 'module/:slug', component: ModuleDetailPage },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
