import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MarketingCampaignService } from '../../services/marketing/marketing-campaign.service';
import { MarketingCampaign } from '../../models/marketing.model';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.html',
  styleUrls: ['./campaign-detail.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [MarketingCampaignService]
})
export class CampaignDetailComponent implements OnInit {
  campaign: MarketingCampaign | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: MarketingCampaignService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.campaignService.getById(id).subscribe({
      next: (data) => {
        this.campaign = data;
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

  retour(): void {
    this.router.navigate(['/client/campaigns']);
  }
}
