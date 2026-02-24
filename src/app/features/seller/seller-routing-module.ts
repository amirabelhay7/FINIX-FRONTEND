import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Listings } from './listings/listings';
import { Orders } from './orders/orders';
import { ListingDetail } from './listing-detail/listing-detail';
import { ListingForm } from './listing-form/listing-form';
import { OrderDetail } from './order-detail/order-detail';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'listings', component: Listings },
  { path: 'listings/new', component: ListingForm },
  { path: 'listings/edit/:id', component: ListingForm },
  { path: 'listings/:id', component: ListingDetail },
  { path: 'orders', component: Orders },
  { path: 'orders/:id', component: OrderDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerRoutingModule { }
