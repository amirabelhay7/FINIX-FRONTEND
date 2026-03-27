import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InboxRoutingModule } from './inbox-routing-module';
import { InboxList } from './inbox-list/inbox-list';

@NgModule({
  declarations: [InboxList],
  imports: [CommonModule, RouterModule, InboxRoutingModule],
})
export class InboxModule {}
