import { TestBed } from '@angular/core/testing';
import { Repayment } from './repayment.service';

describe('Repayment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(Repayment);
    expect(service).toBeTruthy();
  });
});
