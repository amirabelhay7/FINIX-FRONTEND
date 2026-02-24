import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierForm } from './tier-form';

describe('TierForm', () => {
  let component: TierForm;
  let fixture: ComponentFixture<TierForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TierForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
