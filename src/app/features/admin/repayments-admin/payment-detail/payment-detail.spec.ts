import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDetail } from './payment-detail';

describe('PaymentDetail', () => {
  let component: PaymentDetail;
  let fixture: ComponentFixture<PaymentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
