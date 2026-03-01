import { TestBed } from '@angular/core/testing';

import { Credit } from './credit';

describe('Credit', () => {
  let service: Credit;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Credit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
