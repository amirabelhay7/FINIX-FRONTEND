import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTopUp } from './agent-top-up';

describe('AgentTopUp', () => {
  let component: AgentTopUp;
  let fixture: ComponentFixture<AgentTopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [AgentTopUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentTopUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
