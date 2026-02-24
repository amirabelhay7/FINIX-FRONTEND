import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesList } from './vehicles-list';

describe('VehiclesList', () => {
  let component: VehiclesList;
  let fixture: ComponentFixture<VehiclesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehiclesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
