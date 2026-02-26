import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UsersRoutingModule } from './users-routing-module';
import { SharedModule } from '../../../shared/shared-module';
import { List } from './list/list';
import { UserDetail } from './user-detail/user-detail';
import { UserForm } from './user-form/user-form';

@NgModule({
  declarations: [
    List,
    UserDetail,
    UserForm
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    UsersRoutingModule,
    SharedModule
  ]
})
export class UsersModule { }
