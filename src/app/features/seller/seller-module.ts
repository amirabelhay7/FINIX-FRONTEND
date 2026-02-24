import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SellerRoutingModule } from './seller-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { Listings } from './listings/listings';
import { Orders } from './orders/orders';
import { ListingDetail } from './listing-detail/listing-detail';
import { ListingForm } from './listing-form/listing-form';
import { OrderDetail } from './order-detail/order-detail';


@NgModule({
  declarations: [
    Dashboard,
    Listings,
    Orders,
    ListingDetail,
    ListingForm,
    OrderDetail
  ],
  imports: [
    CommonModule,
    RouterModule,
    SellerRoutingModule
  ]
})
export class SellerModule { }
