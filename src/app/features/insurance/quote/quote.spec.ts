import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quote } from './quote';

describe('Quote', () => {
  let component: Quote;
  let fixture: ComponentFixture<Quote>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Quote]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quote);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
