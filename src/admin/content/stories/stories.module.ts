import { Module } from '@nestjs/common';
import { UploadMedia } from '../../../helpers/upload-media';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { ArticleCategoriesController } from '../article-categories/article-categories.controller';
import { ArticlesController } from '../articles/articles.controller';
import { PublishersController } from '../publishers/publishers.controller';
import { PublisherAffiliationService } from './publisher-affiliation.service';
import { StoriesController } from './stories.controller';

@Module({
  imports: [NatsModule],
  controllers: [
    StoriesController,
    PublishersController,
    ArticleCategoriesController,
    ArticlesController,
  ],
  providers: [UploadMedia, NatsJwtAuthGuard, PublisherAffiliationService],
})
export class ContentStoriesModule {}
