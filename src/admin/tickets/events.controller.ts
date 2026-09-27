import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../retail/shared/dto/id.param';

@Controller('admin/tickets/events')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsEventsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.create-event', body);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-events', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.get-event', { id: params.id });
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.update-event', {
      id: params.id,
      ...body,
    });
  }

  @Post(':id/sections')
  createEventSection(
    @Param() params: IdParamDto,
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.create-event-section', {
      eventId: params.id,
      ...body,
    });
  }

  @Get(':id/sections')
  listEventSections(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.list-event-sections', {
      eventId: params.id,
    });
  }

  @Patch('sections/:sectionId')
  updateEventSection(
    @Param('sectionId') sectionId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.update-event-section', {
      id: sectionId,
      ...body,
    });
  }
}

@Controller('admin/tickets/sections')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsSectionsNestedController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.create-section', body);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-sections', query);
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.update-section', {
      id: params.id,
      ...body,
    });
  }
}
