import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kyc } from './kyc';

describe('Kyc', () => {
  let component: Kyc;
  let fixture: ComponentFixture<Kyc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
