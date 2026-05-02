import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTopUp } from './agent-top-up';

describe('AgentTopUp', () => {
  let component: AgentTopUp;
  let fixture: ComponentFixture<AgentTopUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
