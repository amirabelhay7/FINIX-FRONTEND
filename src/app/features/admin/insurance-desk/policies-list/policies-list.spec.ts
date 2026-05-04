import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesList } from './policies-list';

describe('PoliciesList', () => {
  let component: PoliciesList;
  let fixture: ComponentFixture<PoliciesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [PoliciesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliciesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
