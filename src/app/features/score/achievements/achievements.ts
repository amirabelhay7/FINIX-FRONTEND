import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-achievements',
  standalone: false,
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})
export class Achievements implements OnInit {
  
  unlockedAchievements = [
    {
      id: 1,
      title: 'Document Master',
      description: 'Upload and verify all required documents',
      points: 50,
      category: 'Documents',
      unlockedAt: '2 days ago',
      icon: 'verified',
      color: 'green'
    },
    {
      id: 2,
      title: 'Profile Complete',
      description: 'Complete all profile information fields',
      points: 25,
      category: 'Profile',
      unlockedAt: '1 week ago',
      icon: 'person',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Wallet Warrior',
      description: 'Maintain wallet balance above $1000 for 30 days',
      points: 75,
      category: 'Wallet',
      unlockedAt: '2 weeks ago',
      icon: 'account_balance_wallet',
      color: 'purple'
    },
    {
      id: 4,
      title: 'Social Trust',
      description: 'Receive 3 or more guarantees from other users',
      points: 100,
      category: 'Guarantees',
      unlockedAt: '3 weeks ago',
      icon: 'handshake',
      color: 'orange'
    },
    {
      id: 5,
      title: 'Gold Status',
      description: 'Reach Gold tier with 650+ score',
      points: 150,
      category: 'Tier',
      unlockedAt: '1 month ago',
      icon: 'workspace_premium',
      color: 'yellow'
    },
    {
      id: 6,
      title: 'Perfect Payment',
      description: 'Make 10 on-time loan repayments',
      points: 200,
      category: 'Loans',
      unlockedAt: '2 months ago',
      icon: 'payments',
      color: 'red'
    }
  ];

  lockedAchievements = [
    {
      id: 7,
      title: '??? Mystery',
      description: 'Complete a secret challenge',
      points: 300,
      category: 'Secret',
      isSecret: true,
      icon: 'help',
      color: 'gray'
    },
    {
      id: 8,
      title: 'Platinum Elite',
      description: 'Reach Platinum tier with 850+ score',
      points: 300,
      category: 'Tier',
      progress: '132 points to go',
      icon: 'diamond',
      color: 'gray'
    },
    {
      id: 9,
      title: 'Community Leader',
      description: 'Help 10 users get their first loan',
      points: 250,
      category: 'Community',
      progress: '7/10 helped',
      icon: 'groups',
      color: 'gray'
    }
  ];

  selectedCategory = 'All';
  totalUnlocked = 12;
  totalPoints = 580;

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize component data
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  navigateToTutorial(achievement: any) {
    // Navigate to tutorial related to achievement
    console.log('Navigate to tutorial for:', achievement.title);
  }

  viewAchievementDetail(achievement: any) {
    // Show achievement detail modal or navigate to detail page
    console.log('View achievement detail:', achievement.title);
  }
}
