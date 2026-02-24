import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyLoans } from './my-loans';

describe('MyLoans', () => {
  let component: MyLoans;
  let fixture: ComponentFixture<MyLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyLoans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyLoans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
