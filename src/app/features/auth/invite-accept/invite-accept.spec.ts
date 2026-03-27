import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { InviteAccept } from './invite-accept';
import { AuthService } from '../../../services/auth/auth.service';

describe('InviteAccept', () => {
  let fixture: ComponentFixture<InviteAccept>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['validateInviteToken', 'acceptInvite']);
    auth.validateInviteToken.and.returnValue(
      of({ valid: true, email: 'u@test.tn', firstName: 'U', role: 'CLIENT', expiresAt: '2099-01-01T00:00:00' }),
    );
    auth.acceptInvite.and.returnValue(of({ message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule],
      declarations: [InviteAccept],
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ token: 'test-token' })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteAccept);
    fixture.detectChanges();
  });

  it('should validate token on init', () => {
    expect(auth.validateInviteToken).toHaveBeenCalledWith('test-token');
  });

  it('submit calls acceptInvite when passwords match', () => {
    const comp = fixture.componentInstance;
    comp.password = 'password123';
    comp.password2 = 'password123';
    comp.submit();
    expect(auth.acceptInvite).toHaveBeenCalledWith('test-token', 'password123');
  });
});
