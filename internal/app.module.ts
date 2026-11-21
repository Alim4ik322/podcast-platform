import { Module } from '@nestjs/common';
import { AppConfigService } from './config/config.service';
import { PostgresService } from './database/postgres.service';
import { HealthController } from './controller/health.controller';
import { HealthService } from './service/health.service';
import { HealthRepository } from './repository/health.repository';
import { PostgresUserRepository } from './repository/postgres/user.repository';
import { PostgresPodcastRepository } from './repository/postgres/podcast.repository';
import { PostgresSubscriptionRepository } from './repository/postgres/subscription.repository';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const PODCAST_REPOSITORY = Symbol('PODCAST_REPOSITORY');
export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [
    AppConfigService,
    PostgresService,
    HealthService,
    HealthRepository,
    {
      provide: USER_REPOSITORY,
      useFactory: (db: PostgresService) => new PostgresUserRepository(db.getPool()),
      inject: [PostgresService],
    },
    {
      provide: PODCAST_REPOSITORY,
      useFactory: (db: PostgresService) =>
        new PostgresPodcastRepository(db.getPool()),
      inject: [PostgresService],
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useFactory: (db: PostgresService) =>
        new PostgresSubscriptionRepository(db.getPool()),
      inject: [PostgresService],
    },
  ],
  exports: [USER_REPOSITORY, PODCAST_REPOSITORY, SUBSCRIPTION_REPOSITORY],
})
export class AppModule {}