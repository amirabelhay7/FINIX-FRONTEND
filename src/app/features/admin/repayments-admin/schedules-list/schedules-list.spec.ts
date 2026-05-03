import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesList } from './schedules-list';

describe('SchedulesList', () => {
  let component: SchedulesList;
  let fixture: ComponentFixture<SchedulesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchedulesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
