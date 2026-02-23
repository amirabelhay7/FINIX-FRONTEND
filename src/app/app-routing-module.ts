import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { Backoffice } from './layout/backoffice/backoffice';
import { Dashboard } from './features/dashboard/dashboard';
const routes: Routes = [
  {
    path: '',
    component: Frontoffice,
    children: [
      { path: '', loadChildren: () => import('./features/landing-page/landing-page-module').then(m => m.LandingPageModule) }
    ]
  }, {
    path: 'admin',
    component: Backoffice,
    children: [
      { path: 'dashboard', loadChildren: () =>import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
