import { Component } from '@angular/core';
import { ProfileUser, ProfilePersonal, ProfileAddress } from '../../../models';

/**
 * ViewModel: my profile (MVVM).
 */
@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile {
  readonly pageTitle = 'My Profile';
  readonly pageSubtitle = 'Manage your personal information and account details.';
  readonly kycStatusLabel = 'KYC Verified';
  readonly loginHistoryLabel = 'Login History';
  readonly loginHistoryNote = 'Last: 2 mins ago';
  readonly kycStatusNote = 'Verified ✓';
  readonly personalSectionTitle = 'Personal Information';
  readonly addressSectionTitle = 'Address & Location';
  readonly passwordSectionTitle = 'Change Password';
  readonly updatePasswordLabel = 'Update Password';

  readonly user: ProfileUser = {
    avatarUrl: 'https://ui-avatars.com/api/?name=Amadou+Kone&background=135bec&color=fff&size=128',
    fullName: 'Amadou Kone',
    email: 'amadou.kone@email.com',
    role: 'CLIENT',
    roleClass: 'text-[#135bec] bg-blue-50',
    tier: '🥇 Gold',
    tierClass: 'text-yellow-700 bg-yellow-50',
    score: '718 / 850',
  };

  readonly personal: ProfilePersonal = {
    firstName: 'Amadou',
    lastName: 'Kone',
    email: 'amadou.kone@email.com',
    phone: '+216 71 234 567',
    dateOfBirth: '1992-06-15',
    cin: '09123456',
  };

  readonly address: ProfileAddress = {
    street: '12 Rue de la Finance, Bab Souika',
    city: 'Tunis',
    localisation: 'Bab Souika',
  };

  onSaveChanges(): void {}
  onUpdatePassword(): void {}
}
