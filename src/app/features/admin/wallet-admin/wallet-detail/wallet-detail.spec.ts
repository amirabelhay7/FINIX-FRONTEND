import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletDetail } from './wallet-detail';

describe('WalletDetail', () => {
  let component: WalletDetail;
  let fixture: ComponentFixture<WalletDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
