import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesList } from './rules-list';

describe('RulesList', () => {
  let component: RulesList;
  let fixture: ComponentFixture<RulesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [RulesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
