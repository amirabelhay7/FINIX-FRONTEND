import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesList } from './deliveries-list';

describe('DeliveriesList', () => {
  let component: DeliveriesList;
  let fixture: ComponentFixture<DeliveriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
