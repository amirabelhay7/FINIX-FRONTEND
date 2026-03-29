import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MarketingCampaignService } from '../../services/marketing/marketing-campaign.service';
import { MarketingCampaign } from '../../models/marketing.model';

@Component({
  selector: 'app-campaigns-list',
  templateUrl: './campaigns-list.html',
  styleUrls: ['./campaigns-list.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [MarketingCampaignService]
})
export class CampaignsListComponent implements OnInit {
  campaigns: MarketingCampaign[] = [];
  loading = true;

  constructor(
    private campaignService: MarketingCampaignService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.campaignService.getActive().subscribe({
      next: (data) => {
        this.campaigns = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  voirOffre(id: number): void {
    this.router.navigate(['/client/campaigns', id]);
  }
}
