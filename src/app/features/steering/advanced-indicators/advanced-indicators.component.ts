import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import {
  DashboardService,
  AdvancedIndicatorsDTO
} from '../../../services/steering/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-advanced-indicators',
  templateUrl: './advanced-indicators.component.html',
  styleUrls: ['./advanced-indicators.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AdvancedIndicatorsComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('yieldChart')        yieldRef!: ElementRef;
  @ViewChild('gainRateChart')     gainRef!: ElementRef;
  @ViewChild('clientGrowthChart') clientRef!: ElementRef;

  data: AdvancedIndicatorsDTO | null = null;
  loading = true;
  error   = false;

  /** current page: 0=yield, 1=gainRate, 2=clientGrowth, 3=sharpe */
  advPage = 0;

  private charts: Chart[] = [];
  private builtPage = -1;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAdvancedIndicators().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: ()  => { this.error = true; this.loading = false; }
    });
  }

  ngAfterViewChecked(): void {
    if (this.data && this.advPage !== this.builtPage && this.advPage < 3) {
      this.buildChart(this.advPage);
    }
  }

  buildChart(page: number): void {
    if (!this.data) return;

    this.charts.forEach(c => c.destroy());
    this.charts = [];
    this.builtPage = page;

    const months = this.data.months;

    if (page === 0) {
      if (!this.yieldRef) return;
      this.charts.push(new Chart(this.yieldRef.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Yield = Gain / Funds (%)',
            data: this.data.yieldRates,
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139,92,246,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8B5CF6',
            pointRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Yield Evolution (Gain / Funds)' },
            tooltip: { callbacks: { label: ctx => `Yield: ${ctx.parsed.y}%` } }
          },
          scales: { y: { beginAtZero: true, ticks: { callback: v => v + '%' } } }
        }
      }));
    }

    if (page === 1) {
      if (!this.gainRef) return;
      this.charts.push(new Chart(this.gainRef.nativeElement, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Gain Rate (%) per Month',
            data: this.data.gainRates,
            backgroundColor: this.data.gainRates.map(v =>
              v > 15 ? 'rgba(16,185,129,0.8)' :
              v > 8  ? 'rgba(245,158,11,0.8)' :
                       'rgba(239,68,68,0.8)'
            ),
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Gain Rate by Month (%)' },
            tooltip: { callbacks: { label: ctx => `Gain Rate: ${ctx.parsed.y}%` } }
          },
          scales: { y: { beginAtZero: true, ticks: { callback: v => v + '%' } } }
        }
      }));
    }

    if (page === 2) {
      if (!this.clientRef) return;
      this.charts.push(new Chart(this.clientRef.nativeElement, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Total Clients',
              data: this.data.clientCounts,
              backgroundColor: 'rgba(59,130,246,0.6)',
              borderRadius: 4,
              yAxisID: 'y'
            },
            {
              label: 'Growth Rate (%)',
              data: this.data.clientGrowthRates,
              type: 'line' as any,
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245,158,11,0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 5,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: 'Client Growth — Count & Monthly Variation (%)' } },
          scales: {
            y:  { beginAtZero: true, position: 'left',  title: { display: true, text: 'Clients' } },
            y1: { beginAtZero: false, position: 'right', title: { display: true, text: 'Growth %' },
                  grid: { drawOnChartArea: false },
                  ticks: { callback: (v: number) => v + '%' } }
          }
        }
      }));
    }
  }

  getSharpeColor(): string {
    if (!this.data) return '#6B7280';
    if (this.data.sharpeRatio > 1.5) return '#10B981';
    if (this.data.sharpeRatio > 0.8) return '#F59E0B';
    return '#EF4444';
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }
}g
