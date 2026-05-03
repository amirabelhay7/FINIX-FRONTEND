import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guarantees',
  standalone: false,
  templateUrl: './guarantees.html',
  styleUrl: './guarantees.css',
})
export class Guarantees implements OnInit {
  
  selectedTab = 'received';
  
  receivedGuarantees = [
    {
      id: 1,
      guarantorName: 'Alex Johnson',
      guarantorScore: 750,
      pointsOffered: 100,
      reason: 'Strong community trust and reliable payment history',
      createdAt: '2 weeks ago',
      expiresAt: '4 months from now',
      status: 'ACTIVE',
      isAccepted: true,
      acceptedAt: '2 weeks ago'
    },
    {
      id: 2,
      guarantorName: 'Sarah Sidibe',
      guarantorScore: 680,
      pointsOffered: 150,
      reason: 'Long-term business relationship',
      createdAt: '1 month ago',
      expiresAt: '5 months from now',
      status: 'ACTIVE',
      isAccepted: true,
      acceptedAt: '1 month ago'
    },
    {
      id: 3,
      guarantorName: 'Mohamed Ali',
      guarantorScore: 720,
      pointsOffered: 75,
      reason: 'Family connection and financial stability',
      createdAt: '3 days ago',
      expiresAt: '6 months from now',
      status: 'ACTIVE',
      isAccepted: true,
      acceptedAt: '3 days ago'
    }
  ];

  givenGuarantees = [
    {
      id: 4,
      beneficiaryName: 'Fatoumata Touré',
      pointsOffered: 50,
      reason: 'First loan application support',
      createdAt: '1 week ago',
      expiresAt: '6 months from now',
      status: 'ACTIVE',
      isAccepted: true,
      acceptedAt: '5 days ago'
    },
    {
      id: 5,
      beneficiaryName: 'Bakary Konaté',
      pointsOffered: 100,
      reason: 'Business partnership guarantee',
      createdAt: '2 weeks ago',
      expiresAt: '5 months from now',
      status: 'PENDING',
      isAccepted: false,
      acceptedAt: null
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize component data
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  createGuarantee() {
    this.router.navigate(['/score/guarantees/create']);
  }

  viewGuaranteeDetail(guarantee: any) {
    this.router.navigate(['/score/guarantees', guarantee.id]);
  }

  acceptGuarantee(guarantee: any) {
    // Logic to accept a guarantee
    console.log('Accepting guarantee:', guarantee.id);
  }

  rejectGuarantee(guarantee: any) {
    // Logic to reject a guarantee
    console.log('Rejecting guarantee:', guarantee.id);
  }

  getTotalReceivedPoints() {
    return this.receivedGuarantees
      .filter(g => g.isAccepted)
      .reduce((sum, g) => sum + g.pointsOffered, 0);
  }

  getTotalGivenPoints() {
    return this.givenGuarantees
      .filter(g => g.isAccepted)
      .reduce((sum, g) => sum + g.pointsOffered, 0);
  }
}
