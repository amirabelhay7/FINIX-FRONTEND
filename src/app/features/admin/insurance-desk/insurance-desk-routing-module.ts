import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { ProductsList } from './products-list/products-list';
import { PoliciesList } from './policies-list/policies-list';
import { ClaimsList } from './claims-list/claims-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'products', component: ProductsList },
  { path: 'policies', component: PoliciesList },
  { path: 'claims', component: ClaimsList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceDeskRoutingModule { }
