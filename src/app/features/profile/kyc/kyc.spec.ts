import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kyc } from './kyc';

describe('Kyc', () => {
  let component: Kyc;
  let fixture: ComponentFixture<Kyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [Kyc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kyc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
