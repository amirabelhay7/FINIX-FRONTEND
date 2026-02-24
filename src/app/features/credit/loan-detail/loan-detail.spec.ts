import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDetail } from './loan-detail';

describe('LoanDetail', () => {
  let component: LoanDetail;
  let fixture: ComponentFixture<LoanDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
