import { TestBed } from '@angular/core/testing';

import { Score } from './score.service';

describe('Score', () => {
  let service: Score;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Score);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
