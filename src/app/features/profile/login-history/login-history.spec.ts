import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHistory } from './login-history';

describe('LoginHistory', () => {
  let component: LoginHistory;
  let fixture: ComponentFixture<LoginHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [LoginHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
