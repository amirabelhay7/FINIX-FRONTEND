import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletList } from './wallet-list';

describe('WalletList', () => {
  let component: WalletList;
  let fixture: ComponentFixture<WalletList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WalletList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
