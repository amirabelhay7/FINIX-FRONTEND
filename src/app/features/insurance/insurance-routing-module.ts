import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Products } from './products/products';
import { Quote } from './quote/quote';
import { MyPolicies } from './my-policies/my-policies';
import { FileClaim } from './file-claim/file-claim';
import { PolicyDetail } from './policy-detail/policy-detail';
import { MyClaims } from './my-claims/my-claims';
import { ClaimDetail } from './claim-detail/claim-detail';
import { ProductDetail } from './product-detail/product-detail';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'quote', component: Quote },
  { path: 'my-policies', component: MyPolicies },
  { path: 'my-claims', component: MyClaims },
  { path: 'claims/:id', component: ClaimDetail },
  { path: 'file-claim', component: FileClaim },
  { path: 'policy/:id', component: PolicyDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceRoutingModule { }
