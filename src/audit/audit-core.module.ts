import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RequestContextService } from './request-context.service';
import { AUDIT_CONNECTION } from '../tokens';

@Module({
  providers: [
    {
      provide: AuditService,
      useFactory: (connection) => new AuditService(connection),
      inject: [AUDIT_CONNECTION],
    },
    RequestContextService,
  ],
  exports: [AuditService, RequestContextService],
})
export class AuditCoreModule {}