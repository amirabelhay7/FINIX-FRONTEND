import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteesList } from './guarantees-list';

describe('GuaranteesList', () => {
  let component: GuaranteesList;
  let fixture: ComponentFixture<GuaranteesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [GuaranteesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuaranteesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
