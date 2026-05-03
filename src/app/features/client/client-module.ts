import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared-module';
import { ClientRoutingModule } from './client-routing-module';
import { ClientDashboard } from './dashboard/dashboard';
import { ClientCredits } from './credits/credits';
import { ClientRepayments } from './repayments/repayments';
import { ClientVehiclesShell } from './vehicles/client-vehicles-shell';
import { ClientVehicleCatalog } from './vehicles/client-vehicle-catalog/client-vehicle-catalog';
import { ClientVehicleDetail } from './vehicles/client-vehicle-detail/client-vehicle-detail';
import { ClientMyReservations } from './vehicles/client-my-reservations/client-my-reservations';
import { ClientFeedbackPage } from './vehicles/client-feedback-page/client-feedback-page';
import { PageHeaderComponent } from './vehicles/client-vehicle-catalog/components/page-header/page-header.component';
import { VehicleFiltersComponent } from './vehicles/client-vehicle-catalog/components/vehicle-filters/vehicle-filters.component';
import { VehicleStatsCardComponent } from './vehicles/client-vehicle-catalog/components/vehicle-stats-card/vehicle-stats-card.component';
import { VehicleCardComponent } from './vehicles/client-vehicle-catalog/components/vehicle-card/vehicle-card.component';
import { EmptyStateComponent } from './vehicles/client-vehicle-catalog/components/empty-state/empty-state.component';
import { AppFooterComponent } from './vehicles/client-vehicle-catalog/components/app-footer/app-footer.component';
import { VehicleRecommendationsComponent } from './vehicles/client-vehicle-catalog/components/vehicle-recommendations/vehicle-recommendations.component';
import { VehiclePreferencesFormComponent } from './vehicles/client-vehicle-catalog/components/vehicle-preferences-form/vehicle-preferences-form.component';
import { ClientInsurance } from './insurance/insurance';
import { ClientWallet } from './wallet/wallet';
import { ClientScore } from './score/score';
import { ClientDocuments } from './documents/documents';
import { UserProfileComponent } from './user-profile/user-profile';
import { ClientEvents } from './events/events';
import { ClientGroupChat } from './group-chat/group-chat';

@NgModule({
  declarations: [
    ClientDashboard,
    ClientCredits,
    ClientRepayments,
    ClientVehiclesShell,
    ClientVehicleCatalog,
    ClientVehicleDetail,
    ClientMyReservations,
    ClientFeedbackPage,
    PageHeaderComponent,
    VehicleFiltersComponent,
    VehicleStatsCardComponent,
    VehicleCardComponent,
    EmptyStateComponent,
    AppFooterComponent,
    ClientInsurance,
    ClientWallet,
    ClientScore,
    ClientDocuments,
    UserProfileComponent,
    VehicleRecommendationsComponent,
    VehiclePreferencesFormComponent,
    ClientEvents,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ClientRoutingModule,
    SharedModule,
    ClientGroupChat,
  ],
})
export class ClientModule {}
