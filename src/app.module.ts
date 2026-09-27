import { Module } from '@nestjs/common';
import { AuthSharedModule } from './admin/auth/auth-shared.module';
import { NatsModule } from './nats/nats.module';
import { CountryModule } from './admin/sports-catalog/countries/country.module';
import { CompetitionsModule } from './admin/sports-catalog/competitions/competitions.module';
import { EngineGroupsModule } from './admin/competition-engine/groups/groups.module';
import { EngineTeamsModule } from './admin/competition-engine/teams/teams.module';
import { EngineMatchesModule } from './admin/competition-engine/matches/matches.module';
import { EngineStandingsModule } from './admin/competition-engine/standings/standings.module';
import { EngineSeasonsModule } from './admin/competition-engine/seasons/seasons.module';
import { GatewayNationalTeamsModule } from './admin/national-teams/teams/national-teams.module';
import { GatewayNationalMatchesModule } from './admin/national-teams/matches/national-matches.module';
import { GatewayNationalMatchStatsModule } from './admin/national-teams/match-stats/national-match-stats.module';
import { AuthLoginModule } from './admin/auth/login/auth-login.module';
import { AuthUsersModule } from './admin/auth/users/auth-users.module';
import { AuthProfilesModule } from './admin/auth/profiles/auth-profiles.module';
import { AuthPasswordModule } from './admin/auth/password/auth-password.module';
import { AuthRegisterModule } from './admin/auth/register/auth-register.module';
import { UploadModule } from './upload/upload.module';
import { SportsCatalogMobileModule } from './mobile/sports-catalog/sports-catalog-mobile.module';
import { CompetitionEngineModule } from './mobile/competition-engine/competition-engine.module';
import { NationalTeamsMobileModule } from './mobile/national-teams/national-teams.module';
import { RetailMobileModule } from './mobile/retail/retail-mobile.module';
import { OrdersModule } from './admin/retail/orders/orders.module';
import { ProductsModule } from './admin/retail/products/products.module';
import { CartsModule } from './admin/retail/carts/carts.module';
import { CategoriesModule } from './admin/retail/categories/categories.module';
import { CustomerAuthMobileModule } from './mobile/customer-auth/customer-auth-mobile.module';
import { AdminTicketsModule } from './admin/tickets/tickets.module';
import { TicketsMobileModule } from './mobile/tickets/tickets-mobile.module';
import { ContentStoriesModule } from './admin/content/stories/stories.module';
import { MobileContentStoriesModule } from './mobile/content/stories/mobile-stories.module';

@Module({
  imports: [
    AuthSharedModule,
    NatsModule,
    UploadModule,
    CountryModule,
    CompetitionsModule,
    EngineGroupsModule,
    EngineTeamsModule,
    EngineMatchesModule,
    EngineStandingsModule,
    EngineSeasonsModule,
    GatewayNationalTeamsModule,
    GatewayNationalMatchesModule,
    GatewayNationalMatchStatsModule,
    AuthLoginModule,
    AuthUsersModule,
    AuthProfilesModule,
    AuthPasswordModule,
    AuthRegisterModule,
    SportsCatalogMobileModule,
    CompetitionEngineModule,
    NationalTeamsMobileModule,
    RetailMobileModule,
    OrdersModule,
    ProductsModule,
    CartsModule,
    CategoriesModule,
    CustomerAuthMobileModule,
    AdminTicketsModule,
    TicketsMobileModule,
    ContentStoriesModule,
    MobileContentStoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
