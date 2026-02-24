import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsList } from './payments-list';

describe('PaymentsList', () => {
  let component: PaymentsList;
  let fixture: ComponentFixture<PaymentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
