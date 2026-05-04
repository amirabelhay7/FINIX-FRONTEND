import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorsList } from './indicators-list';

describe('IndicatorsList', () => {
  let component: IndicatorsList;
  let fixture: ComponentFixture<IndicatorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [IndicatorsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
