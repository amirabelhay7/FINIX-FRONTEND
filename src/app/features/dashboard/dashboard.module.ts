import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard } from './dashboard';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
    declarations: [
        Dashboard
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule
    ]
})
export class DashboardModule { }
