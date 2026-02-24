import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scoring-dashboard',
  standalone: false,
  templateUrl: './scoring-dashboard.html',
  styleUrl: './scoring-dashboard.css',
})
export class ScoringDashboard implements OnInit {
  
  currentScore = 718;
  maxScore = 850;
  scorePercentage = 84;
  userTier = 'Gold';
  pointsToNextTier = 132;

  scoreBreakdown = {
    documents: 120,
    profile: 85,
    wallet: 45,
    guarantees: 468
  };

  recentChanges = [
    { type: 'document', description: 'ID Document Verified', points: 30, time: '2 hours ago', icon: 'trending_up', color: 'green' },
    { type: 'profile', description: 'Profile Completed', points: 25, time: 'Yesterday', icon: 'person_add', color: 'blue' },
    { type: 'guarantee', description: 'Guarantee Received', points: 100, time: '3 days ago', icon: 'handshake', color: 'orange' },
    { type: 'achievement', description: 'Achievement Unlocked', points: 50, time: '1 week ago', icon: 'workspace_premium', color: 'purple' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize component data
  }

  refreshScore() {
    // Placeholder - will connect to ScoringService
    console.log('Refreshing score...');
  }

  navigateToAchievements() {
    this.router.navigate(['/score/achievements']);
  }

  navigateToTutorials() {
    this.router.navigate(['/score/tutorials']);
  }

  navigateToGuarantees() {
    this.router.navigate(['/score/guarantees']);
  }
}
