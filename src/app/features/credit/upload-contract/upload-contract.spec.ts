import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadContract } from './upload-contract';

describe('UploadContract', () => {
  let component: UploadContract;
  let fixture: ComponentFixture<UploadContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadContract);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
