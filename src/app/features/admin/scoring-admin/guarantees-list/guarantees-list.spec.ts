import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteesList } from './guarantees-list';

describe('GuaranteesList', () => {
  let component: GuaranteesList;
  let fixture: ComponentFixture<GuaranteesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuaranteesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuaranteesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
