import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanVerification } from './loan-verification';

describe('LoanVerification', () => {
  let component: LoanVerification;
  let fixture: ComponentFixture<LoanVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanVerification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
