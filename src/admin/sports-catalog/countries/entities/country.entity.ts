import { CompetitionEntity } from '../../competitions/entity/competition.entity';

export class CountryEntity {
  id: string;
  name: string;
  countryName: string;
  countryCode: string;
  logo: string;
  description: string;
  region: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  competitions: CompetitionEntity[];
  constructor(data: {
    id: string;
    name: string;
    countryName: string;
    countryCode: string;
    logo: string;
    description: string;
    region: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    competitions: CompetitionEntity[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.countryName = data.countryName;
    this.countryCode = data.countryCode;
    this.logo = data.logo;
    this.description = data.description;
    this.region = data.region;
    this.order = data.order;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.competitions = data.competitions;
  }
}
