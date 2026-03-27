import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserDetail } from './user-detail';
import { AdminUserService } from '../../../../services/user/admin-user.service';

describe('UserDetail', () => {
  let component: UserDetail;
  let fixture: ComponentFixture<UserDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
        {
          provide: AdminUserService,
          useValue: {
            getById: () =>
              of({
                id: 1,
                firstName: 'A',
                lastName: 'B',
                email: 'a@b.c',
                role: 'CLIENT',
              }),
            getLoginHistory: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
