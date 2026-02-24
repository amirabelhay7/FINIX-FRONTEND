import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteeDetail } from './guarantee-detail';

describe('GuaranteeDetail', () => {
  let component: GuaranteeDetail;
  let fixture: ComponentFixture<GuaranteeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuaranteeDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuaranteeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
