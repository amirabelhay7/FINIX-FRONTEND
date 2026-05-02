import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  providers: [DecimalPipe]
})
export class FinancialSteeringChartsComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('defaultRateChart') defaultRateRef!: ElementRef;
  @ViewChild('cashFlowChart')    cashFlowRef!: ElementRef;
  @ViewChild('riskChart')        riskRef!: ElementRef;
  @ViewChild('salaryPieChart')   salaryPieRef!: ElementRef;
  @ViewChild('regionPieChart')   regionPieRef!: ElementRef;

  dashboard: FinancialSteeringDashboard | null = null;
  loading = true;
  error   = false;

  /** current chart page: 0-4 = charts, 5 = recommendations */
  chartPage = 0;

  /** recommendations filter + pagination */
  recoSearch  = '';
  recoPage    = 0;
  recoPageSize = 4;

  private charts: Chart[] = [];
  /** tracks which page was last built so we rebuild when switching */
  private builtPage = -1;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getFullDashboard().subscribe({
      next: (data) => { this.dashboard = data; this.loading = false; },
      error: ()     => { this.error = true;   this.loading = false; }
    });
  }

  ngAfterViewChecked(): void {
    if (this.dashboard && this.chartPage !== this.builtPage && this.chartPage < 5) {
      this.buildChart(this.chartPage);
    }
  }

  // ── Chart builder — one chart per page ──────────────────────────────────
  buildChart(page: number): void {
    if (!this.dashboard) return;

    // destroy only the chart for the previous page (keep others if needed)
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    this.builtPage = page;

    const d = this.dashboard;

    if (page === 0) {
      if (!this.defaultRateRef) return;
      const months = d.monthlyEvolution.map(m => m.month);
      const rates  = d.monthlyEvolution.map(m => m.tauxDefaut);
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
          plugins: { title: { display: true, text: 'Default Rate Evolution by Month' } },
          scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } } }
        }
      }));
    }

    if (page === 1) {
      if (!this.cashFlowRef) return;
      this.charts.push(new Chart(this.cashFlowRef.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Cash Flow'],
          datasets: [
            { label: 'INFLOW (TND)',  data: [d.totalInflow],  backgroundColor: 'rgba(16,185,129,0.8)' },
            { label: 'OUTFLOW (TND)', data: [d.totalOutflow], backgroundColor: 'rgba(239,68,68,0.8)' }
          ]
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'INFLOW vs OUTFLOW (TND)' } },
          scales: { y: { beginAtZero: true } }
        }
      }));
    }

    if (page === 2) {
      if (!this.riskRef) return;
      const riskMonths = d.riskIndicators.map(r => r.month);
      const riskPcts   = d.riskIndicators.map(r => r.riskPercentage);
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
    }

    if (page === 3) {
      if (!this.salaryPieRef) return;
      const salaryLabels = d.defaultBySalary.map(s => s.segment);
      const salaryData   = d.defaultBySalary.map(s => s.tauxDefaut);
      this.charts.push(new Chart(this.salaryPieRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: salaryLabels,
          datasets: [{ data: salaryData, backgroundColor: ['#EF4444','#F59E0B','#10B981'] }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Default Rate by Salary Range' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
          }
        }
      }));
    }

    if (page === 4) {
      if (!this.regionPieRef) return;
      const regionLabels = d.defaultByRegion.map(s => s.segment);
      const regionData   = d.defaultByRegion.map(s => s.tauxDefaut);
      this.charts.push(new Chart(this.regionPieRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: regionLabels,
          datasets: [{ data: regionData, backgroundColor: ['#3B82F6','#EF4444','#10B981','#F59E0B','#8B5CF6'] }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Default Rate by Region' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
          }
        }
      }));
    }
  }

  // ── Recommendations filter + pagination ─────────────────────────────────
  get filteredRecos() {
    if (!this.dashboard?.riskIndicators) return [];
    const q = this.recoSearch.trim().toLowerCase();
    return q
      ? this.dashboard.riskIndicators.filter(r => r.month.toLowerCase().includes(q))
      : this.dashboard.riskIndicators;
  }

  get pagedRecos() {
    const start = this.recoPage * this.recoPageSize;
    return this.filteredRecos.slice(start, start + this.recoPageSize);
  }

  get recoTotalPages(): number {
    return Math.ceil(this.filteredRecos.length / this.recoPageSize);
  }

  get recoPageNumbers(): number[] {
    return Array.from({ length: this.recoTotalPages }, (_, i) => i);
  }

  onRecoSearch(): void { this.recoPage = 0; }

  recoGoTo(page: number): void {
    this.recoPage = Math.max(0, Math.min(page, this.recoTotalPages - 1));
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }
}
