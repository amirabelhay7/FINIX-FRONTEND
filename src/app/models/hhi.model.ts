// src/app/models/hhi.model.ts

export interface HHISegment {
  label: string;
  share: number;        // 0.0 – 1.0
  loanCount: number;
  squaredShare: number;
}

export interface RebalancingTarget {
  segmentLabel: string;
  dimension: 'REGIONAL' | 'SALARY';
  currentShare: number;
  targetShare: number;
  currentHHI: number;
  targetHHI: number;
  recommendation: string;
  actionRequired: boolean;
}

export interface HHIResult {
  hhiRegional: number;
  hhiSalary: number;
  hhiRegionalLevel: 'DIVERSIFIED' | 'MODERATE' | 'CONCENTRATED';
  hhiSalaryLevel:   'DIVERSIFIED' | 'MODERATE' | 'CONCENTRATED';
  diversificationScore: number;
  diversificationLabel: 'HEALTHY' | 'FRAGILE' | 'CRITICAL';
  regionalSegments: HHISegment[];
  salarySegments:   HHISegment[];
  rebalancingTargets: RebalancingTarget[];
  recommendations:    string[];
}

export interface SimulatorRequest {
  regionalShares: Record<string, number>;   // label → % (0-100)
  salaryShares:   Record<string, number>;
}
