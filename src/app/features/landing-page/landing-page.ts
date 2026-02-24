import { Component, AfterViewInit, ElementRef } from '@angular/core';

/** Trust strip stat item. */
export interface LandingTrustStat {
  value: string;
  valueClass?: string;
  label: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements AfterViewInit {
  readonly heroBadge = 'Micro-finance & micro-insurance';
  readonly heroTitlePart1 = 'Credit, wallet & insurance';
  readonly heroTitleHighlight = ' in one place.';
  readonly heroSubtitle = 'FINIX connects clients, agents, and sellers with fair scoring, digital wallets, and vehicle financing—built for Tunisia and beyond.';
  readonly ctaPrimaryLabel = 'Get started';
  readonly ctaPrimaryRoute = '/auth';
  readonly ctaSecondaryLabel = 'Explore credit';
  readonly ctaSecondaryRoute = '/credit';

  readonly trustStats: LandingTrustStat[] = [
    { value: '11', valueClass: 'text-[#135bec]', label: 'Backend modules' },
    { value: '4', label: 'User roles' },
    { value: 'Wallet', label: 'Online & agent top-up' },
    { value: 'Score', label: 'Alternative scoring' },
  ];

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const root = this.el.nativeElement;
    const animated = root.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('in-view');
            el.querySelectorAll('.landing-reveal').forEach((child) => child.classList.add('in-view'));
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.08 }
    );
    animated.forEach((el) => observer.observe(el));
  }
}
