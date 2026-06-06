import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  constructor(private readonly config: ConfigService) {}

  getClient(): Redis {
    if (!this.client) {
      const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
      this.client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    }
    return this.client;
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}
