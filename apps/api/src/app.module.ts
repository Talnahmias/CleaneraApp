import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CleanersModule } from './cleaners/cleaners.module';
import { FavoritesModule } from './favorites/favorites.module';
import { JobsModule } from './jobs/jobs.module';
import { PrismaModule } from './prisma/prisma.module';
import { RatingsModule } from './ratings/ratings.module';
import { RecurringModule } from './recurring/recurring.module';
import { RedisModule } from './redis/redis.module';
import { ServiceTypesModule } from './service-types/service-types.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    ServiceTypesModule,
    JobsModule,
    CleanersModule,
    FavoritesModule,
    RecurringModule,
    ChatModule,
    RatingsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
