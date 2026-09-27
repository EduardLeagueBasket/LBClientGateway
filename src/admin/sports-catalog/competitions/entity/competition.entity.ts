import { CountryEntity } from '../../countries/entities/country.entity';

export class CompetitionEntity {
  id: string;
  name: string;
  type: string;
  gender: string;
  logo: string;
  season: string;
  countryId: string;
  country: CountryEntity | null;
  createdById?: string | null;
  managerUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: {
    id: string;
    name: string;
    type: string;
    gender: string;
    logo: string;
    season: string;
    countryId: string;
    country: CountryEntity | null;
    createdById?: string | null;
    managerUserId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.gender = data.gender;
    this.logo = data.logo;
    this.season = data.season;
    this.countryId = data.countryId;
    this.country = data.country;
    this.createdById = data.createdById;
    this.managerUserId = data.managerUserId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
