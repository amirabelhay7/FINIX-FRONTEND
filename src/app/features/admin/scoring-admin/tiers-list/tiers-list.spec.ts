import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiersList } from './tiers-list';

describe('TiersList', () => {
  let component: TiersList;
  let fixture: ComponentFixture<TiersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TiersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
