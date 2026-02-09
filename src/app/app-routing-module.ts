import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'front-office', pathMatch: 'full' },
  // { path: 'front-office', component: FrontOfficeTemplateComponent },
  // { path: 'back-office', component: BackOfficeTemplateComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
