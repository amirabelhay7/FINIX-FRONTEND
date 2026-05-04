import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesList } from './vehicles-list';

describe('VehiclesList', () => {
  let component: VehiclesList;
  let fixture: ComponentFixture<VehiclesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
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
