import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InsuranceRoutingModule } from './insurance-routing-module';
import { Products } from './products/products';
import { Quote } from './quote/quote';
import { MyPolicies } from './my-policies/my-policies';
import { FileClaim } from './file-claim/file-claim';
import { PolicyDetail } from './policy-detail/policy-detail';
import { MyClaims } from './my-claims/my-claims';
import { ClaimDetail } from './claim-detail/claim-detail';
import { ProductDetail } from './product-detail/product-detail';


@NgModule({
  declarations: [
    Products,
    Quote,
    MyPolicies,
    FileClaim,
    PolicyDetail,
    MyClaims,
    ClaimDetail,
    ProductDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    InsuranceRoutingModule
  ]
})
export class InsuranceModule { }
