import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationsList } from './simulations-list';

describe('SimulationsList', () => {
  let component: SimulationsList;
  let fixture: ComponentFixture<SimulationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [SimulationsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
