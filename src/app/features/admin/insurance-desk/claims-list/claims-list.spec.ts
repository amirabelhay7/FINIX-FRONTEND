import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsList } from './claims-list';

describe('ClaimsList', () => {
  let component: ClaimsList;
  let fixture: ComponentFixture<ClaimsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ClaimsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
