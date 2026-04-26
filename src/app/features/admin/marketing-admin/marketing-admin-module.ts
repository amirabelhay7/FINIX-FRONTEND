import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MarketingAdminRoutingModule } from './marketing-admin-routing-module';
import { List } from './list/list';
import { CampaignsList } from './campaigns-list/campaigns-list';
import { EventsList } from './events-list/events-list';
import { SegmentsList } from './segments-list/segments-list';


@NgModule({
  declarations: [
    List,
    CampaignsList,
    EventsList,
    SegmentsList
  ],
  imports: [
    CommonModule,
    RouterModule,
    MarketingAdminRoutingModule
  ]
})
export class MarketingAdminModule { }
