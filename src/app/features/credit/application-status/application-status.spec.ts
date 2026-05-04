import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationStatus } from './application-status';

describe('ApplicationStatus', () => {
  let component: ApplicationStatus;
  let fixture: ComponentFixture<ApplicationStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ApplicationStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
