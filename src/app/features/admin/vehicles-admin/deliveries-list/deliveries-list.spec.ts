import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesList } from './deliveries-list';

describe('DeliveriesList', () => {
  let component: DeliveriesList;
  let fixture: ComponentFixture<DeliveriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DeliveriesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveriesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
