import { Component, OnInit } from '@angular/core';
import {
  CreditMetric,
  CreditProduct,
  CreditRequest,
} from '../../core/mock-data/credit.mock';
import { CreditService } from '../../core/services/credit.service';

@Component({
  selector: 'app-credit',
  standalone: false,
  templateUrl: './credit.html',
  styleUrl: './credit.scss',
})
export class Credit implements OnInit {
  metrics: CreditMetric[] = [];
  products: CreditProduct[] = [];
  requests: CreditRequest[] = [];

  constructor(private creditService: CreditService) {}

  ngOnInit(): void {
    this.creditService.getMetrics().subscribe((m) => (this.metrics = m));
    this.creditService.getProducts().subscribe((p) => (this.products = p));
    this.creditService.getRecentRequests().subscribe((r) => (this.requests = r));
  }
}

