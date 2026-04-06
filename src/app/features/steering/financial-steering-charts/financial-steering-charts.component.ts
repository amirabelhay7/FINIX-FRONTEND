import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {
  DashboardService,
  FinancialSteeringDashboard
} from '../../../services/steering/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-financial-steering-charts',
  templateUrl: './financial-steering-charts.component.html',
  styleUrls: ['./financial-steering-charts.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe]
})
export class FinancialSteeringChartsComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('defaultRateChart') defaultRateRef!: ElementRef;
  @ViewChild('cashFlowChart') cashFlowRef!: ElementRef;
  @ViewChild('riskChart') riskRef!: ElementRef;
  @ViewChild('salaryPieChart') salaryPieRef!: ElementRef;
  @ViewChild('regionPieChart') regionPieRef!: ElementRef;

  dashboard: FinancialSteeringDashboard | null = null;
  loading = true;
  error = false;

  private charts: Chart[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getFullDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.dashboard && !this.charts.length) {
      this.buildCharts();
    }
  }

  buildCharts(): void {
    if (!this.dashboard) return;
    if (!this.defaultRateRef || !this.cashFlowRef || !this.riskRef
      || !this.salaryPieRef || !this.regionPieRef) return;

    const months = this.dashboard.monthlyEvolution.map(m => m.month);
    const rates = this.dashboard.monthlyEvolution.map(m => m.tauxDefaut);

    this.charts.push(new Chart(this.defaultRateRef.nativeElement, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Default Rate (%)',
          data: rates,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239,68,68,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#EF4444',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Default Rate Evolution by Month' }
        },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } }
        }
      }
    }));

    this.charts.push(new Chart(this.cashFlowRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Cash Flow'],
        datasets: [
          { label: 'INFLOW (TND)', data: [this.dashboard.totalInflow], backgroundColor: 'rgba(16,185,129,0.8)' },
          { label: 'OUTFLOW (TND)', data: [this.dashboard.totalOutflow], backgroundColor: 'rgba(239,68,68,0.8)' }
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'INFLOW vs OUTFLOW (TND)' } },
        scales: { y: { beginAtZero: true } }
      }
    }));

    const riskMonths = this.dashboard.riskIndicators.map(r => r.month);
    const riskPcts = this.dashboard.riskIndicators.map(r => r.riskPercentage);
    const riskColors = riskPcts.map(v =>
      v >= 40 ? 'rgba(239,68,68,0.8)' : v >= 20 ? 'rgba(245,158,11,0.8)' : 'rgba(16,185,129,0.8)'
    );

    this.charts.push(new Chart(this.riskRef.nativeElement, {
      type: 'bar',
      data: {
        labels: riskMonths,
        datasets: [{ label: 'Risk % by Month', data: riskPcts, backgroundColor: riskColors }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { title: { display: true, text: 'Portfolio Risk % by Month' } },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } } }
      }
    }));

    const salaryLabels = this.dashboard.defaultBySalary.map(s => s.segment);
    const salaryData = this.dashboard.defaultBySalary.map(s => s.tauxDefaut);

    this.charts.push(new Chart(this.salaryPieRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: salaryLabels,
        datasets: [{ data: salaryData, backgroundColor: ['#EF4444', '#F59E0B', '#10B981'] }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Default Rate by Salary Range (Jan 2025)' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
        }
      }
    }));

    const regionLabels = this.dashboard.defaultByRegion.map(s => s.segment);
    const regionData = this.dashboard.defaultByRegion.map(s => s.tauxDefaut);

    this.charts.push(new Chart(this.regionPieRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: regionLabels,
        datasets: [{ data: regionData, backgroundColor: ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6'] }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Default Rate by Region (Mar 2025)' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }
}
