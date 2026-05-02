import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface ScoreChange {
  id: number;
  previousScore: number;
  newScore: number;
  scoreChange: number;
  reason: string;
  ruleType: string;
  changeType: string;
  changedAt: string;
  triggeredBy: string;
  referenceId?: string;
}

@Component({
  selector: 'app-score-history',
  standalone: false,
  templateUrl: './score-history.html',
  styleUrl: './score-history.css',
})
export class ScoreHistory implements OnInit {
  readonly Math = Math;

  scoreHistory: ScoreChange[] = [
    {
      id: 1,
      previousScore: 688,
      newScore: 718,
      scoreChange: 30,
      reason: 'ID Document Verified',
      ruleType: 'DOCUMENT',
      changeType: 'INCREASE',
      changedAt: '2 hours ago',
      triggeredBy: 'SYSTEM',
      referenceId: 'DOC-001'
    },
    {
      id: 2,
      previousScore: 693,
      newScore: 718,
      scoreChange: 25,
      reason: 'Profile Completed',
      ruleType: 'PROFILE',
      changeType: 'INCREASE',
      changedAt: 'Yesterday',
      triggeredBy: 'USER_ACTION',
      referenceId: undefined
    },
    {
      id: 3,
      previousScore: 618,
      newScore: 718,
      scoreChange: 100,
      reason: 'Guarantee Received',
      ruleType: 'GUARANTEE',
      changeType: 'INCREASE',
      changedAt: '3 days ago',
      triggeredBy: 'SYSTEM',
      referenceId: 'GUAR-003'
    },
    {
      id: 4,
      previousScore: 668,
      newScore: 718,
      scoreChange: 50,
      reason: 'Achievement Unlocked',
      ruleType: 'ACHIEVEMENT',
      changeType: 'BONUS',
      changedAt: '1 week ago',
      triggeredBy: 'SYSTEM',
      referenceId: 'ACH-001'
    },
    {
      id: 5,
      previousScore: 718,
      newScore: 698,
      scoreChange: -20,
      reason: 'Late Loan Payment',
      ruleType: 'LOAN',
      changeType: 'PENALTY',
      changedAt: '2 weeks ago',
      triggeredBy: 'SYSTEM',
      referenceId: 'LOAN-001'
    }
  ];

  selectedFilter = 'all';
  filters = ['all', 'increase', 'decrease', 'bonus', 'penalty'];

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize component data
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getFilteredHistory() {
    if (this.selectedFilter === 'all') {
      return this.scoreHistory;
    }
    
    return this.scoreHistory.filter(change => {
      switch (this.selectedFilter) {
        case 'increase':
          return change.changeType === 'INCREASE';
        case 'decrease':
          return change.changeType === 'DECREASE';
        case 'bonus':
          return change.changeType === 'BONUS';
        case 'penalty':
          return change.changeType === 'PENALTY';
        default:
          return true;
      }
    });
  }

  getChangeTypeIcon(changeType: string) {
    switch (changeType) {
      case 'INCREASE':
        return 'trending_up';
      case 'DECREASE':
        return 'trending_down';
      case 'BONUS':
        return 'workspace_premium';
      case 'PENALTY':
        return 'warning';
      default:
        return 'change_history';
    }
  }

  getChangeTypeColor(changeType: string) {
    switch (changeType) {
      case 'INCREASE':
        return 'green';
      case 'DECREASE':
        return 'red';
      case 'BONUS':
        return 'purple';
      case 'PENALTY':
        return 'orange';
      default:
        return 'gray';
    }
  }
}
