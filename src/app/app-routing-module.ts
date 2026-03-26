import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
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
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'admin/:page',
    component: BackofficeComponent,
    canActivate: [roleGuard('admin')],
  },
  {
    path: 'agent',
    redirectTo: 'agent/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'agent/:page',
    component: AgentLayout,
    canActivate: [roleGuard('agent')],
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
