import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUp } from './top-up';

describe('TopUp', () => {
  let component: TopUp;
  let fixture: ComponentFixture<TopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [TopUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
