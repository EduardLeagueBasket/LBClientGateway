export class TeamEntity {
  id!: string;
  name!: string;
  logo?: string | null;
  isActive!: boolean;
  sellsTickets!: boolean;
  competitionId!: string;
  groupId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date;
}
