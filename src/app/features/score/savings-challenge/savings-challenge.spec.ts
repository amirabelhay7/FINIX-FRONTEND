import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsChallenge } from './savings-challenge';

describe('SavingsChallenge', () => {
  let component: SavingsChallenge;
  let fixture: ComponentFixture<SavingsChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [SavingsChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingsChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
