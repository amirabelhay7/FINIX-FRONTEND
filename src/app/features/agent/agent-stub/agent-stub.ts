import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agent-stub',
  standalone: false,
  templateUrl: './agent-stub.html',
})
export class AgentStubComponent implements OnInit, OnDestroy {
  page = '';
  private sub?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((p) => {
      this.page = p.get('page') ?? '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
