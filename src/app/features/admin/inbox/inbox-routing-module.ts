import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxList } from './inbox-list/inbox-list';

const routes: Routes = [{ path: '', component: InboxList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboxRoutingModule {}
