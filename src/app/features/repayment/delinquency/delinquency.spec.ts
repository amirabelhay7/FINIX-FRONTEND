import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Delinquency } from './delinquency';

describe('Delinquency', () => {
  let component: Delinquency;
  let fixture: ComponentFixture<Delinquency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [Delinquency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Delinquency);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
