import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleForm } from './rule-form';

describe('RuleForm', () => {
  let component: RuleForm;
  let fixture: ComponentFixture<RuleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [RuleForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
