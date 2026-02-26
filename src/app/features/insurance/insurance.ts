import { Component, OnInit } from '@angular/core';
import {
  InsuranceMetric,
  InsurancePolicy,
} from '../../core/mock-data/insurance.mock';
import { InsuranceService } from '../../core/services/insurance.service';

@Component({
  selector: 'app-insurance',
  standalone: false,
  templateUrl: './insurance.html',
  styleUrl: './insurance.scss',
})
export class Insurance implements OnInit {
  metrics: InsuranceMetric[] = [];
  policies: InsurancePolicy[] = [];

  constructor(private insuranceService: InsuranceService) {}

  ngOnInit(): void {
    this.insuranceService.getMetrics().subscribe((m) => (this.metrics = m));
    this.insuranceService.getPolicies().subscribe((p) => (this.policies = p));
  }
}

