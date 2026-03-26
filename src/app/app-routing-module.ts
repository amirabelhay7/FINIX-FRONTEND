import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
import { AdminShellComponent } from './layout/admin-shell/admin-shell.component';
import { AgentShell } from './layout/agent-shell/agent-shell';
import { AdminClients } from './features/admin/clients/admin-clients';
import { AdminSettings } from './features/admin/settings/admin-settings';
import { roleGuard } from './core/guards/auth-guard';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';

const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'seller',
    component: SellerLayout,
    canActivate: [roleGuard('seller')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/seller/seller-module').then((m) => m.SellerModule),
      },
    ],
  },
  { path: 'vendeur', redirectTo: 'seller', pathMatch: 'full' },
  { path: 'vendeur/vendeur', redirectTo: 'seller', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BackofficeComponent },
      {
        path: 'notifications',
        loadChildren: () => import('./features/admin/marketing-admin/marketing-admin-module').then((m) => m.MarketingAdminModule),
      },
      { path: 'clients', component: AdminClients },
      {
        path: 'credits',
        loadChildren: () => import('./features/admin/credit-center/credit-center-module').then((m) => m.CreditCenterModule),
      },
      {
        path: 'repayments',
        loadChildren: () => import('./features/admin/repayments-admin/repayments-admin-module').then((m) => m.RepaymentsAdminModule),
      },
      {
        path: 'vehicles',
        loadChildren: () => import('./features/admin/vehicles-admin/vehicles-admin-module').then((m) => m.VehiclesAdminModule),
      },
      {
        path: 'insurance',
        loadChildren: () => import('./features/admin/insurance-desk/insurance-desk-module').then((m) => m.InsuranceDeskModule),
      },
      {
        path: 'risk',
        loadChildren: () => import('./features/admin/scoring-admin/scoring-admin-module').then((m) => m.ScoringAdminModule),
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/admin/steering-admin/steering-admin-module').then((m) => m.SteeringAdminModule),
      },
      { path: 'settings', component: AdminSettings },
      {
        path: 'users',
        loadChildren: () => import('./features/admin/users/users-module').then((m) => m.UsersModule),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'agent',
    component: AgentShell,
    canActivate: [roleGuard('agent')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/agent/agent-module').then((m) => m.AgentModule),
      },
    ],
  },
  {
    path: 'insurer',
    redirectTo: 'insurer/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'insurer/:section',
    component: InsurerLayout,
    canActivate: [roleGuard('insurer')],
  },
  {
    path: 'client',
    component: Frontoffice,
    canActivate: [roleGuard('client')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/client/client-module').then((m) => m.ClientModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
