import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { MobileArticlesController } from '../articles/mobile-articles.controller';
import { MobileStoriesController } from './mobile-stories.controller';

@Module({
  imports: [NatsModule],
  controllers: [MobileStoriesController, MobileArticlesController],
})
export class MobileContentStoriesModule {}
