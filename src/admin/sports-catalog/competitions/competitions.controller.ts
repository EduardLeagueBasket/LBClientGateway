import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMedia } from '../../../helpers/upload-media';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../../competition-engine/shared/dto/id.param';
import { LeagueScopeService } from './league-scope.service';

type CompetitionRecord = {
  id: string;
  name: string;
  logo?: string | null;
  managerUserId?: string | null;
  country?: { countryCode?: string };
  countryCode?: string;
};

@Controller('admin/competitions')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CompetitionsController {
  constructor(
    private readonly uploadMedia: UploadMedia,
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
    private readonly leagueScope: LeagueScopeService,
  ) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  async findAll(@Req() req: { user?: GatewayUserAuth }) {
    const managerUserId = await this.resolveManagerUserIdFilter(req.user);
    if (
      this.isLeagueStaff(req.user?.profile?.name) &&
      !managerUserId
    ) {
      return [];
    }
    return this.natsService.send('list-competitions', {
      ...(managerUserId ? { managerUserId } : {}),
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  async findById(
    @Req() req: { user?: GatewayUserAuth },
    @Param() params: IdParamDto,
  ) {
    const competition = await firstValueFrom(
      this.natsService.send<CompetitionRecord>('get-competition', {
        id: params.id,
      }),
    );
    await this.assertCanAccessCompetition(req.user, competition);
    return competition;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateCompetition(
    @Param() params: IdParamDto,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: UpdateCompetitionDto = { ...updateCompetitionDto };
    if (file) {
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'competitions',
      );
      data.logo = uploadResult.secure_url;
    }
    if (data.managerUserId === '') {
      data.managerUserId = null;
    }
    const previous = await firstValueFrom(
      this.natsService.send<CompetitionRecord>('get-competition', {
        id: params.id,
      }),
    );
    const competition = await firstValueFrom(
      this.natsService.send<CompetitionRecord>('update-competition', {
        id: params.id,
        data,
      }),
    );
    await this.syncManagerCompetition(previous, competition);
    this.syncLeaguePublisher(competition);
    return competition;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createCompetition(
    @Req() req: { user?: { id?: string } },
    @Body() createCompetitionDto: CreateCompetitionDto,
    @UploadedFile() files: Express.Multer.File,
  ): Promise<CompetitionRecord> {
    if (files) {
      const uploadResult = await this.uploadMedia.uploadImage(
        files,
        'competitions',
      );
      createCompetitionDto.logo = uploadResult.secure_url;
    }
    const payload = {
      name: createCompetitionDto.name,
      type: createCompetitionDto.type,
      gender: createCompetitionDto.gender,
      logo: createCompetitionDto.logo,
      season: createCompetitionDto.season,
      countryId: createCompetitionDto.countryId,
      createdById: req.user?.id,
      managerUserId: createCompetitionDto.managerUserId || undefined,
    };
    const competition = await firstValueFrom(
      this.natsService.send<CompetitionRecord>('create-competition', payload),
    );
    await this.syncManagerCompetition(null, competition);
    this.syncLeaguePublisher(competition);
    return competition;
  }

  private isLeagueStaff(profile?: string): boolean {
    return profile === 'MANAGER_LEAGUE' || profile === 'ASISTANT_LEAGUE';
  }

  private async resolveManagerUserIdFilter(
    user?: GatewayUserAuth,
  ): Promise<string | undefined> {
    const profile = user?.profile?.name;
    if (profile === 'MANAGER_LEAGUE') {
      return user?.id;
    }
    if (profile === 'ASISTANT_LEAGUE' && user?.id) {
      const fullUser = await firstValueFrom(
        this.natsService.send<{ createdById?: string | null }>(
          'auth.get-user-by-id',
          { id: user.id },
        ),
      );
      return fullUser?.createdById || undefined;
    }
    return undefined;
  }

  private async assertCanAccessCompetition(
    user: GatewayUserAuth | undefined,
    competition: CompetitionRecord | null,
  ) {
    if (!this.isLeagueStaff(user?.profile?.name)) {
      return;
    }
    const allowedManagerId = await this.resolveManagerUserIdFilter(user);
    if (
      !allowedManagerId ||
      !competition?.id ||
      competition.managerUserId !== allowedManagerId
    ) {
      throw new ForbiddenException('No tienes acceso a esta competencia');
    }
  }

  private async syncManagerCompetition(
    previous: CompetitionRecord | null,
    competition: CompetitionRecord,
  ) {
    const previousManagerId = previous?.managerUserId || null;
    const nextManagerId = competition.managerUserId || null;

    if (previousManagerId && previousManagerId !== nextManagerId) {
      await this.leagueScope.setUserCompetition(previousManagerId, null);
    }
    if (nextManagerId) {
      await this.leagueScope.setUserCompetition(nextManagerId, competition.id);
    }
  }

  private syncLeaguePublisher(competition: CompetitionRecord) {
    if (!competition?.id) {
      return;
    }
    this.natsService.emit('publisher.sync', {
      entity_type: 'league',
      entity_id: competition.id,
      display_name: competition.name,
      avatar_url: competition.logo ?? '',
      is_verified: true,
      country_code: String(
        competition.country?.countryCode ||
          competition.countryCode ||
          'GLOBAL',
      ).toUpperCase(),
    });
  }
}
