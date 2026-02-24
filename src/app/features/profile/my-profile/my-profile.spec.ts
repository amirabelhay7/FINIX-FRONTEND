import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProfile } from './my-profile';

describe('MyProfile', () => {
  let component: MyProfile;
  let fixture: ComponentFixture<MyProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
