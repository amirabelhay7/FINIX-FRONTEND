import { TestBed } from '@angular/core/testing';

import { Repayment } from './repayment';

describe('Repayment', () => {
  let service: Repayment;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Repayment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
