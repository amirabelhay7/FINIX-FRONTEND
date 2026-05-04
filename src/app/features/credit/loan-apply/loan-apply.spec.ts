import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanApply } from './loan-apply';

describe('LoanApply', () => {
  let component: LoanApply;
  let fixture: ComponentFixture<LoanApply>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [LoanApply]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanApply);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
