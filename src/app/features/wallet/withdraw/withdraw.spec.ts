import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Withdraw } from './withdraw';

describe('Withdraw', () => {
  let component: Withdraw;
  let fixture: ComponentFixture<Withdraw>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [Withdraw]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Withdraw);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
