import { TestBed } from '@angular/core/testing';
import { Score } from './score.service';

describe('Score', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(Score);
    expect(service).toBeTruthy();
  });
});
