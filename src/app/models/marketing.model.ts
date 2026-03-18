// src/app/models/marketing.model.ts

// ── Nouveaux modèles (backend réel) ──
export interface MarketingCampaign {
  id?: number;
  name: string;
  description: string;
  campaignType: 'ACQUISITION' | 'RETENTION' | 'PROMOTION';
  startDate: string;
  endDate: string;
  budget: number;
  status: 'PLANNED' | 'ACTIVE' | 'FINISHED';
  createdAt?: string;
}

export interface CustomerSegment {
  id?: number;
  name: string;
  description: string;
  minIncome: number;
  maxIncome: number;
  employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';
  geographicZone: string;
  createdAt?: string;
}

export interface CampaignSegmentLink {
  id?: number;
  campaignId: number;
  segmentId: number;
  createdAt?: string;
}

export interface CampaignCreditLink {
  id?: number;
  campaignId: number;
  creditId: number;
  creditAmount: number;
  interestAmount: number;
  appliedDiscountRate: number;
  grantedDate: string;
  createdAt?: string;
}

// ── Anciens modèles statiques (gardés pour compatibilité) ──
export interface Segment {
  id: number;
  name: string;
  criteria: string;
  members: string;
  lastUsed: string;
}

export interface Campaign {
  id: number;
  name: string;
  channel: string;
  segment: string;
  status: string;
  statusClass: string;
  startEnd: string;
}

export interface EventListItem {
  id: number;
  name: string;
  date: string;
  registrations: string;
}
