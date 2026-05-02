import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SellerRoutingModule } from './seller-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { Listings } from './listings/listings';
import { Orders } from './orders/orders';
import { ListingDetail } from './listing-detail/listing-detail';
import { ListingForm } from './listing-form/listing-form';
import { OrderDetail } from './order-detail/order-detail';
import { SellerVehiclesPage } from './vehicles-page/vehicles-page';
import { SellerProfileComponent } from './profile/profile';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [
    Dashboard,
    Listings,
    Orders,
    ListingDetail,
    ListingForm,
    OrderDetail,
    SellerVehiclesPage,
    SellerProfileComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, SellerRoutingModule, SharedModule],
})
export class SellerModule {}
