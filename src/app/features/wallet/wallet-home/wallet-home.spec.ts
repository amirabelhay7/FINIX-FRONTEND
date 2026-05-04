import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletHome } from './wallet-home';

describe('WalletHome', () => {
  let component: WalletHome;
  let fixture: ComponentFixture<WalletHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [WalletHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
