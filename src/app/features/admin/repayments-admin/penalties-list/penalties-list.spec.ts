import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesList } from './penalties-list';

describe('PenaltiesList', () => {
  let component: PenaltiesList;
  let fixture: ComponentFixture<PenaltiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PenaltiesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
