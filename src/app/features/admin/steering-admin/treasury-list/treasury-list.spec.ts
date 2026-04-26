import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasuryList } from './treasury-list';

describe('TreasuryList', () => {
  let component: TreasuryList;
  let fixture: ComponentFixture<TreasuryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreasuryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreasuryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
