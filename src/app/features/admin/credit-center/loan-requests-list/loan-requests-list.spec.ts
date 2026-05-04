import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRequestsList } from './loan-requests-list';

describe('LoanRequestsList', () => {
  let component: LoanRequestsList;
  let fixture: ComponentFixture<LoanRequestsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [LoanRequestsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanRequestsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
