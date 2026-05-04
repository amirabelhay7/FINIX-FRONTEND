import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsList } from './tutorials-list';

describe('TutorialsList', () => {
  let component: TutorialsList;
  let fixture: ComponentFixture<TutorialsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [TutorialsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
