import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tutorials } from './tutorials';

describe('Tutorials', () => {
  let component: Tutorials;
  let fixture: ComponentFixture<Tutorials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Tutorials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tutorials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
