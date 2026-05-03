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
import { MyPolicy } from './my-policy/my-policy';
import { InsuranceHub } from './insurance-hub/insurance-hub';
import { CreditRequestForm } from './credit-request-form/credit-request-form';
import { CreditRequests } from './credit-requests/credit-requests';
import { CreditRequestDetail } from './credit-request-detail/credit-request-detail';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: InsuranceHub },
  { path: 'products', component: Products },
  { path: 'products/:id', component: ProductDetail },
  { path: 'quote', component: Quote },
  { path: 'my-policy', component: MyPolicy },
  { path: 'my-policies', component: MyPolicies },
  { path: 'my-claims', component: MyClaims },
  { path: 'credit-requests/new', component: CreditRequestForm },
  { path: 'credit-requests', component: CreditRequests },
  { path: 'credit-requests/:id', component: CreditRequestDetail },
  { path: 'claims/:id', component: ClaimDetail },
  { path: 'file-claim', component: FileClaim },
  /** Alias — même écran (estimation claim uniquement). */
  { path: 'simulation', component: FileClaim },
  { path: 'policy/:id', component: PolicyDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceRoutingModule { }
