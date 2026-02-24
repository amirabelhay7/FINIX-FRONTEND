import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Delinquency } from './delinquency';

describe('Delinquency', () => {
  let component: Delinquency;
  let fixture: ComponentFixture<Delinquency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Delinquency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Delinquency);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
