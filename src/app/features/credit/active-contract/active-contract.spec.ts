import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveContract } from './active-contract';

describe('ActiveContract', () => {
  let component: ActiveContract;
  let fixture: ComponentFixture<ActiveContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ActiveContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveContract);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
