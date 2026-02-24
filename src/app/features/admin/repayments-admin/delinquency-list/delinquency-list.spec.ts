import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyList } from './delinquency-list';

describe('DelinquencyList', () => {
  let component: DelinquencyList;
  let fixture: ComponentFixture<DelinquencyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelinquencyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelinquencyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
