import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Transfer } from './transfer';

describe('Transfer', () => {
  let component: Transfer;
  let fixture: ComponentFixture<Transfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Transfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Transfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
