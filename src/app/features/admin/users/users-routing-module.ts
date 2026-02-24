import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { List } from './list/list';
import { UserDetail } from './user-detail/user-detail';
import { UserForm } from './user-form/user-form';

const routes: Routes = [
  { path: '', component: List },
  { path: 'new', component: UserForm },
  { path: 'edit/:id', component: UserForm },
  { path: ':id', component: UserDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
