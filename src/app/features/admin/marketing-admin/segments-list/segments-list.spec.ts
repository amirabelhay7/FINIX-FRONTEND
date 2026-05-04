import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsList } from './segments-list';

describe('SegmentsList', () => {
  let component: SegmentsList;
  let fixture: ComponentFixture<SegmentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [SegmentsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegmentsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
