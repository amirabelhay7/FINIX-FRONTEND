import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { CampaignsList } from './campaigns-list/campaigns-list';
import { EventsList } from './events-list/events-list';
import { SegmentsList } from './segments-list/segments-list';

const routes: Routes = [
  { path: '', component: List },
  { path: 'campaigns', component: CampaignsList },
  { path: 'events', component: EventsList },
  { path: 'segments', component: SegmentsList }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingAdminRoutingModule { }
