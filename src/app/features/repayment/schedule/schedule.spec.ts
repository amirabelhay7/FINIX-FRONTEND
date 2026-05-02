import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Schedule } from './schedule';

describe('Schedule', () => {
  let component: Schedule;
  let fixture: ComponentFixture<Schedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Schedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
