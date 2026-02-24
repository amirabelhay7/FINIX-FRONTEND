import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentsList } from './segments-list';

describe('SegmentsList', () => {
  let component: SegmentsList;
  let fixture: ComponentFixture<SegmentsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
