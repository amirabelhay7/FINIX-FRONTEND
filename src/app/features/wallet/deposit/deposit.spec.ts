import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Deposit } from './deposit';

describe('Deposit', () => {
  let component: Deposit;
  let fixture: ComponentFixture<Deposit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Deposit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deposit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
