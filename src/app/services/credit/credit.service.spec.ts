import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Credit } from './credit.service';

describe('Credit', () => {
  let service: Credit;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Credit);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
