import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringDashboard } from './scoring-dashboard';

describe('ScoringDashboard', () => {
  let component: ScoringDashboard;
  let fixture: ComponentFixture<ScoringDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ScoringDashboard],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoringDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
