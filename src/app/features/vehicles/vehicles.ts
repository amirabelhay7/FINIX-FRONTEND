import { Component, OnInit } from '@angular/core';
import {
  VehicleItem,
  VehicleMetric,
} from '../../core/mock-data/vehicles.mock';
import { VehiclesService } from '../../core/services/vehicles.service';

@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles implements OnInit {
  metrics: VehicleMetric[] = [];
  vehicles: VehicleItem[] = [];

  constructor(private vehiclesService: VehiclesService) {}

  ngOnInit(): void {
    this.vehiclesService.getMetrics().subscribe((m) => (this.metrics = m));
    this.vehiclesService.getVehicles().subscribe((v) => (this.vehicles = v));
  }
}

