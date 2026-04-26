import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsList } from './events-list';

describe('EventsList', () => {
  let component: EventsList;
  let fixture: ComponentFixture<EventsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
