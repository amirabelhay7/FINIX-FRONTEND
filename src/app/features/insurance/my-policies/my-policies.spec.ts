import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPolicies } from './my-policies';

describe('MyPolicies', () => {
  let component: MyPolicies;
  let fixture: ComponentFixture<MyPolicies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyPolicies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPolicies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
