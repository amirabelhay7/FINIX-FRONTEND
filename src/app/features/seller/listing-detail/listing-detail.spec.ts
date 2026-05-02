import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetail } from './listing-detail';

describe('ListingDetail', () => {
  let component: ListingDetail;
  let fixture: ComponentFixture<ListingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListingDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
