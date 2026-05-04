import { TestBed } from '@angular/core/testing';
import { Wallet } from './wallet.service';

describe('Wallet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service = TestBed.inject(Wallet);
    expect(service).toBeTruthy();
  });
});
