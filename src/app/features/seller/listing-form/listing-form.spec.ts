import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingForm } from './listing-form';

describe('ListingForm', () => {
  let component: ListingForm;
  let fixture: ComponentFixture<ListingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ListingForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
