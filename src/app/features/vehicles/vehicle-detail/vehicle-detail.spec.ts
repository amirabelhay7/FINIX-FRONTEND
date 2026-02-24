import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDetail } from './vehicle-detail';

describe('VehicleDetail', () => {
  let component: VehicleDetail;
  let fixture: ComponentFixture<VehicleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
