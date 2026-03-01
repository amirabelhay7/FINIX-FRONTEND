import { TestBed } from '@angular/core/testing';

import { Insurance } from './insurance';

describe('Insurance', () => {
  let service: Insurance;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Insurance);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
