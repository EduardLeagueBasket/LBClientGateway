import { CountryEntity } from '../../../admin/sports-catalog/countries/entities/country.entity';

export class NationalTeamEntity {
  id!: string;
  name!: string;
  logo?: string | null;
  isActive!: boolean;
  competitionId?: string | null;
  countryId?: string | null;
  countryCode?: string | null;
  type?: string | null;
  region?: string | null;
  country?: CountryEntity | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date;
}
