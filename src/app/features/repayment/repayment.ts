import { Component, OnInit } from '@angular/core';
import {
  RepaymentMetric,
  RepaymentScheduleRow,
} from '../../core/mock-data/repayment.mock';
import { RepaymentService } from '../../core/services/repayment.service';

@Component({
  selector: 'app-repayment',
  standalone: false,
  templateUrl: './repayment.html',
  styleUrl: './repayment.scss',
})
export class Repayment implements OnInit {
  metrics: RepaymentMetric[] = [];
  schedule: RepaymentScheduleRow[] = [];

  constructor(private repaymentService: RepaymentService) {}

  ngOnInit(): void {
    this.repaymentService.getMetrics().subscribe((m) => (this.metrics = m));
    this.repaymentService.getSchedule().subscribe((s) => (this.schedule = s));
  }
}

