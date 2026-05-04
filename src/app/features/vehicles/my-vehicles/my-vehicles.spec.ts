import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyVehicles } from './my-vehicles';

describe('MyVehicles', () => {
  let component: MyVehicles;
  let fixture: ComponentFixture<MyVehicles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [MyVehicles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyVehicles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
