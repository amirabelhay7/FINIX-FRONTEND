import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownPayment } from './down-payment';

describe('DownPayment', () => {
  let component: DownPayment;
  let fixture: ComponentFixture<DownPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DownPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
