import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InsuranceRoutingModule } from './insurance-routing-module';
import { Products } from './products/products';
import { Quote } from './quote/quote';
import { MyPolicies } from './my-policies/my-policies';
import { FileClaim } from './file-claim/file-claim';
import { PolicyDetail } from './policy-detail/policy-detail';
import { MyClaims } from './my-claims/my-claims';
import { ClaimDetail } from './claim-detail/claim-detail';
import { ProductDetail } from './product-detail/product-detail';
import { MyPolicy } from './my-policy/my-policy';
import { InsuranceNav } from './insurance-nav/insurance-nav';
import { InsuranceHub } from './insurance-hub/insurance-hub';
import { CreditRequestForm } from './credit-request-form/credit-request-form';
import { CreditRequests } from './credit-requests/credit-requests';
import { CreditRequestDetail } from './credit-request-detail/credit-request-detail';


@NgModule({
  declarations: [
    InsuranceNav,
    InsuranceHub,
    Products,
    Quote,
    MyPolicy,
    MyPolicies,
    FileClaim,
    PolicyDetail,
    MyClaims,
    ClaimDetail,
    ProductDetail,
    CreditRequestForm,
    CreditRequests,
    CreditRequestDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InsuranceRoutingModule
  ]
})
export class InsuranceModule { }
