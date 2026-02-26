import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly faqs: FaqItem[] = [
    {
      question: 'What is FINIX?',
      answer: 'FINIX is a modular finance platform that brings together credit, scoring, wallet, insurance, repayment and vehicle collateral in one ecosystem for lenders and insurers.',
      open: false,
    },
    {
      question: 'Which modules can I use?',
      answer: 'You can use Credit, Scoring, Wallet, Insurance, Repayment and Vehicles. Each module can be enabled independently and integrated via APIs.',
      open: false,
    },
    {
      question: 'How do I get admin access?',
      answer: 'Sign in with an email that ends with @admin.com (e.g. test@admin.com) to access the backoffice dashboard. Other users are redirected to the front-office home.',
      open: false,
    },
    {
      question: 'Is there an API?',
      answer: 'Yes. All modules expose REST APIs for integration with your systems. Documentation and API keys are available after onboarding.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs.forEach((faq, i) => {
      faq.open = i === index ? !faq.open : false;
    });
  }
}
