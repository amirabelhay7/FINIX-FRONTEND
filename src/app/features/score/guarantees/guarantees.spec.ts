import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guarantees } from './guarantees';

describe('Guarantees', () => {
  let component: Guarantees;
  let fixture: ComponentFixture<Guarantees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Guarantees]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guarantees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
