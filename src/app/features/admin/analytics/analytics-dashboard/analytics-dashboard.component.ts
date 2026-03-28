import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../../services/analytics/analytics.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule]
})
export class AnalyticsDashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Dashboard Data
  dashboardData: any = {};
  treasuryTrend: any[] = [];
  transactionVolume: any[] = [];
  walletStats: any = {};
  limitViolations: any[] = [];

  // Chart Options
  treasuryChartOptions: any = {};
  volumeChartOptions: any = {};
  walletChartOptions: any = {};

  // Date Range
  selectedDays = 30;
  dayOptions = [7, 14, 30, 60, 90];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;

    // Load all analytics data in parallel
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.setupWalletChart();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data';
        console.error('Dashboard data error:', err);
      }
    });

    this.analyticsService.getTreasuryBalanceTrend(this.selectedDays).subscribe({
      next: (data) => {
        this.treasuryTrend = data;
        this.setupTreasuryChart();
      },
      error: (err) => {
        this.error = 'Failed to load treasury trend';
        console.error('Treasury trend error:', err);
      }
    });

    this.analyticsService.getTransactionVolumeAnalytics(this.selectedDays).subscribe({
      next: (data) => {
        this.transactionVolume = data;
        this.setupVolumeChart();
      },
      error: (err) => {
        this.error = 'Failed to load transaction volume';
        console.error('Transaction volume error:', err);
      }
    });

    this.analyticsService.getWalletStatistics().subscribe({
      next: (data) => {
        this.walletStats = data;
      },
      error: (err) => {
        this.error = 'Failed to load wallet statistics';
        console.error('Wallet stats error:', err);
      }
    });

    // Set loading to false after a reasonable time
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  onDaysChange(): void {
    this.loadAllData();
  }

  // Chart Setup Methods
  private setupTreasuryChart(): void {
    this.treasuryChartOptions = {
      series: [{
        name: 'Treasury Balance',
        data: this.treasuryTrend.map(item => item.balance)
      }],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      },
      xaxis: {
        categories: this.treasuryTrend.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
      },
      yaxis: {
        labels: {
          formatter: (val: number) => this.formatCurrency(val)
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => this.formatCurrency(val)
        }
      },
      colors: ['#6366f1']
    };
  }

  private setupVolumeChart(): void {
    const depositData = this.transactionVolume.map(item => item.DEPOSIT_VOLUME || 0);
    const transferData = this.transactionVolume.map(item => item.TRANSFER_VOLUME || 0);
    const adminTopUpData = this.transactionVolume.map(item => item.ADMIN_TOP_UP_VOLUME || 0);

    this.volumeChartOptions = {
      series: [
        { name: 'Deposits', data: depositData },
        { name: 'Transfers', data: transferData },
        { name: 'Admin Top-ups', data: adminTopUpData }
      ],
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%'
        }
      },
      xaxis: {
        categories: this.transactionVolume.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
      },
      yaxis: {
        labels: {
          formatter: (val: number) => this.formatCurrency(val)
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => this.formatCurrency(val)
        }
      },
      colors: ['#10b981', '#3b82f6', '#f59e0b']
    };
  }

  private setupWalletChart(): void {
    this.walletChartOptions = {
      series: [
        this.dashboardData.activeWallets || 0,
        this.dashboardData.inactiveWallets || 0
      ],
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['Active Wallets', 'Inactive Wallets'],
      colors: ['#10b981', '#ef4444'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom'
      }
    };
  }

  // Utility Methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-TN').format(value);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }
}
