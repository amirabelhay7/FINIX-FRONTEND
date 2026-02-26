export interface ScoreMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface ScoreFactor {
  label: string;
  impact: 'High' | 'Medium' | 'Low';
  direction: 'positive' | 'negative';
}

export interface ScoreHistoryPoint {
  label: string;
  value: number;
}

export const SCORING_METRICS: ScoreMetric[] = [
  {
    label: 'Average portfolio score',
    value: '718',
    subtitle: 'Across all active borrowers',
  },
  {
    label: 'High-risk segment',
    value: '12%',
    subtitle: 'Flagged for closer review',
  },
  {
    label: 'Auto-approval rate',
    value: '64%',
    subtitle: 'Based on behavioural scoring',
  },
];

export const SCORING_FACTORS: ScoreFactor[] = [
  {
    label: 'Repayment consistency',
    impact: 'High',
    direction: 'positive',
  },
  {
    label: 'Wallet balance volatility',
    impact: 'Medium',
    direction: 'negative',
  },
  {
    label: 'Document completeness',
    impact: 'Low',
    direction: 'positive',
  },
  {
    label: 'Device & geo fingerprint',
    impact: 'Medium',
    direction: 'positive',
  },
];

export const SCORING_HISTORY: ScoreHistoryPoint[] = [
  { label: 'Jan', value: 702 },
  { label: 'Feb', value: 709 },
  { label: 'Mar', value: 715 },
  { label: 'Apr', value: 722 },
  { label: 'May', value: 718 },
  { label: 'Jun', value: 726 },
];

