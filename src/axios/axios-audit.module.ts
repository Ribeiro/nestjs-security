import { Module, Global } from '@nestjs/common';
import { AxiosAuditInterceptor } from './axios-audit.interceptor';
import { AuditCoreModule } from '../audit/audit-core.module';

@Global()
@Module({
  imports: [AuditCoreModule],
  providers: [AxiosAuditInterceptor],
  exports: [AxiosAuditInterceptor],
})
export class AxiosAuditModule {}
