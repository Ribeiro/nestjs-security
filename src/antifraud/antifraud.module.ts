import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AntifraudInterceptor } from './antifraud.interceptor';
import { AuditModule } from '../audit/audit.module';
import { REDIS_CLIENT } from '../tokens';
import Redis from 'ioredis';

@Module({
  imports: [
    AuditModule.forRoot(),
  ],
  providers: [
    Reflector,
    {
      provide: REDIS_CLIENT,
      useFactory: () => new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      }),
    },
    AntifraudInterceptor,
  ],
  exports: [AntifraudInterceptor],
})
export class AntifraudModule {}