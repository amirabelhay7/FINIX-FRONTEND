import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { TreasuryList } from './treasury-list/treasury-list';
import { IndicatorsList } from './indicators-list/indicators-list';
import { SimulationsList } from './simulations-list/simulations-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'treasury', component: TreasuryList },
  { path: 'indicators', component: IndicatorsList },
  { path: 'simulations', component: SimulationsList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SteeringAdminRoutingModule { }
