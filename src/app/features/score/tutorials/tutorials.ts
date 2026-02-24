import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedMinutes: number;
  pointsAwarded: number;
  status: string;
  completedAt?: string;
  icon: string;
  color: string;
  progress?: number;
  prerequisites?: string;
}

@Component({
  selector: 'app-tutorials',
  standalone: false,
  templateUrl: './tutorials.html',
  styleUrl: './tutorials.css',
})
export class Tutorials implements OnInit {
  
  selectedCategory = 'All';
  selectedDifficulty = 'All';

  tutorials: Tutorial[] = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Learn how to fill out your profile information to maximize your score',
      type: 'Profile',
      difficulty: 'Easy',
      estimatedMinutes: 10,
      pointsAwarded: 25,
      status: 'COMPLETED',
      completedAt: '1 week ago',
      icon: 'person',
      color: 'green'
    },
    {
      id: 2,
      title: 'Document Verification Guide',
      description: 'Step-by-step guide to uploading and verifying required documents',
      type: 'Documents',
      difficulty: 'Medium',
      estimatedMinutes: 15,
      pointsAwarded: 30,
      status: 'IN_PROGRESS',
      progress: 60,
      icon: 'description',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Wallet Management Basics',
      description: 'Understanding wallet features and maintaining healthy balance',
      type: 'Wallet',
      difficulty: 'Easy',
      estimatedMinutes: 12,
      pointsAwarded: 20,
      status: 'NOT_STARTED',
      icon: 'account_balance_wallet',
      color: 'gray'
    },
    {
      id: 4,
      title: 'Social Guarantees Explained',
      description: 'How to give and receive guarantees to boost community trust',
      type: 'Guarantees',
      difficulty: 'Medium',
      estimatedMinutes: 20,
      pointsAwarded: 50,
      status: 'NOT_STARTED',
      icon: 'handshake',
      color: 'gray'
    },
    {
      id: 5,
      title: 'Advanced Score Strategies',
      description: 'Expert tips to maximize your credit score quickly',
      type: 'General',
      difficulty: 'Hard',
      estimatedMinutes: 25,
      pointsAwarded: 75,
      status: 'LOCKED',
      prerequisites: 'Complete profile + 2 tutorials',
      icon: 'workspace_premium',
      color: 'gray'
    }
  ];

  categories = ['All', 'Profile', 'Documents', 'Wallet', 'Guarantees', 'General'];
  difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize component data
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  selectDifficulty(difficulty: string) {
    this.selectedDifficulty = difficulty;
  }

  startTutorial(tutorial: Tutorial) {
    if (tutorial.status === 'LOCKED') {
      console.log('Tutorial locked:', tutorial.title);
      return;
    }
    // Navigate to tutorial content or start tutorial
    console.log('Starting tutorial:', tutorial.title);
    this.router.navigate(['/score/tutorials', tutorial.id]);
  }

  viewTutorialDetail(tutorial: Tutorial) {
    this.router.navigate(['/score/tutorials', tutorial.id]);
  }

  getFilteredTutorials() {
    let filtered = this.tutorials;
    
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.type === this.selectedCategory);
    }
    
    if (this.selectedDifficulty !== 'All') {
      filtered = filtered.filter(t => t.difficulty === this.selectedDifficulty);
    }
    
    return filtered;
  }
}
