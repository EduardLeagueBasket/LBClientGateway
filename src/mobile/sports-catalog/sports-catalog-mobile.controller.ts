import { Controller, Get, Inject } from '@nestjs/common';
import { NATS_SERVICE } from '../../config/service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CountryEntity } from '../../admin/sports-catalog/countries/entities/country.entity';
import { TeamEntity } from './entities/team.entity';
import { NationalTeamEntity } from './entities/national-team.entity';

@Controller('sports-catalog')
export class SportsCatalogMobileController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  async getCountries() {
    const countries = await firstValueFrom(
      this.natsService.send<CountryEntity[]>('get-all-countries', {}),
    );

    const nationalTeams = await firstValueFrom(
      this.natsService.send<NationalTeamEntity[]>(
        'national-teams.list-national-teams',
        {},
      ),
    );

    const isRegionalTeam = (team: NationalTeamEntity) =>
      team.type === 'regional';

    const teams = await firstValueFrom(
      this.natsService.send<TeamEntity[]>('competition-engine.list-teams', {}),
    );
    /**
     * competitions que SI tienen equipos
     */
    const competitionsWithTeams = new Set(
      teams
        .filter((team) => team.competitionId)
        .map((team) => team.competitionId),
    );

    const groupByCountry = (
      list: NationalTeamEntity[],
      predicate: (team: NationalTeamEntity) => boolean,
    ) =>
      list.reduce(
        (acc, team) => {
          if (!team.isActive || !predicate(team)) {
            return acc;
          }

          const catalogCountryId =
            team.countryId ||
            countries.find(
              (country) =>
                country.countryCode &&
                team.countryCode &&
                country.countryCode.toUpperCase() ===
                  String(team.countryCode).toUpperCase(),
            )?.id;

          if (!catalogCountryId) {
            return acc;
          }

          if (!acc[catalogCountryId]) {
            acc[catalogCountryId] = [];
          }

          acc[catalogCountryId].push(team);
          return acc;
        },
        {} as Record<string, NationalTeamEntity[]>,
      );

    const nationalTeamsByCountry = groupByCountry(
      nationalTeams,
      (team) => !isRegionalTeam(team),
    );
    const regionalTeamsByCountry = groupByCountry(
      nationalTeams,
      isRegionalTeam,
    );

    const filteredCountries = countries
      .filter((country) => {
        // país debe estar activo
        if (!country.isActive) {
          return false;
        }

        /**
         * Tiene alguna competición
         * que además tenga equipos
         */
        const hasCompetitionWithTeams =
          country.competitions?.some((competition) =>
            competitionsWithTeams.has(competition.id),
          ) ?? false;

        const hasNationalTeam = nationalTeamsByCountry[country.id]?.length > 0;
        const hasRegionalTeam = regionalTeamsByCountry[country.id]?.length > 0;

        return hasCompetitionWithTeams || hasNationalTeam || hasRegionalTeam;
      })
      .map((country) => ({
        ...country,
        nationalTeams: nationalTeamsByCountry[country.id] ?? [],
        regionalTeams: regionalTeamsByCountry[country.id] ?? [],
      }));

    return filteredCountries;
  }
}
