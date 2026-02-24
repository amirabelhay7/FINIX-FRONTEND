import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsList } from './products-list';

describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
