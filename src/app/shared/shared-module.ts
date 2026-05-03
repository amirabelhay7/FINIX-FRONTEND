import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Spinner } from './components/spinner/spinner';
import { Alert } from './components/alert/alert';
import { Button } from './components/button/button';
import { Modal } from './components/modal/modal';
import { VehicleWorkspaceComponent } from './components/vehicle-workspace/vehicle-workspace.component';
import { VehicleStatsComponent } from './components/vehicle-stats/vehicle-stats.component';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
    Spinner,
    Alert,
    Button,
    Modal,
    VehicleWorkspaceComponent,
    VehicleStatsComponent,
  ],
  imports: [CommonModule, FormsModule, BaseChartDirective],
  exports: [
    Spinner,
    Alert,
    Button,
    Modal,
    VehicleWorkspaceComponent,
    VehicleStatsComponent,
  ],
})
export class SharedModule {}
