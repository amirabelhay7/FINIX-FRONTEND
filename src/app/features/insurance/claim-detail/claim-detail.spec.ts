import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDetail } from './claim-detail';

describe('ClaimDetail', () => {
  let component: ClaimDetail;
  let fixture: ComponentFixture<ClaimDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClaimDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
