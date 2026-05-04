import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Achievements } from './achievements';

describe('Achievements', () => {
  let component: Achievements;
  let fixture: ComponentFixture<Achievements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [Achievements],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Achievements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
