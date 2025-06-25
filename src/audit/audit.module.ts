import { Module, DynamicModule } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { loadAndValidateSecurityEnv } from '../config/env.loader';
import { AUDIT_CONNECTION } from '../tokens';
import { AuditService } from './audit.service';

@Module({})
export class AuditModule {
  static forRoot(): DynamicModule {
    const env = loadAndValidateSecurityEnv();

    return {
      module: AuditModule,
      global: true,
      providers: [
        {
          provide: AUDIT_CONNECTION,
          useFactory: async () => {
            const ds = new DataSource({
              type: 'postgres',
              host: env.SECURITY_DB_HOST,
              port: env.SECURITY_DB_PORT,
              username: env.SECURITY_DB_USERNAME,
              password: env.SECURITY_DB_PASSWORD,
              database: env.SECURITY_DB_NAME,
              name: 'auditConnection',
              entities: [],
              synchronize: false,
            });
            await ds.initialize();
            return ds;
          },
        },
        AuditService,
      ],
      exports: [AUDIT_CONNECTION, AuditService],
    };
  }
}