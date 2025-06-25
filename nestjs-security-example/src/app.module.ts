import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Módulos de segurança
import { AuditModule, AntifraudModule, AxiosAuditModule } from 'nestjs-security';

// Domínio
import { PagamentoController } from './pagamento/pagamento.controller';
import { Pagamento } from './pagamento/pagamento.entity';
import { RandomUserModule } from './usuario/random-user.module';

@Module({
  imports: [
    // 1. Configuração de ambiente (deve vir primeiro)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
      cache: true,
    }),

    // 2. Módulos de segurança (segunda posição)
    AuditModule.forRoot(),   // Inicializa primeiro - conexão de auditoria
    AntifraudModule,        // Depende do Redis e AuditService
    AxiosAuditModule,       // Depende do AuditService

    // 3. Database principal (produção)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') ?? config.get('SECURITY_DB_HOST'), 
        port: parseInt(config.get('DB_PORT') ?? config.get('SECURITY_DB_PORT') ?? '5432'),
        username: config.get('DB_USERNAME') ?? config.get('SECURITY_DB_USERNAME'),
        password: config.get('DB_PASSWORD') ?? config.get('SECURITY_DB_PASSWORD'),
        database: config.get('DB_NAME') ?? config.get('SECURITY_DB_NAME'),
        entities: [Pagamento],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        poolSize: 10, // Número máximo de conexões
        extra: {
          connectionTimeoutMillis: 2000, // Timeout de conexão
        }
      }),
    }),

    // 4. Módulos de entidades
    TypeOrmModule.forFeature([Pagamento]),

    // 5. Módulos de negócio (última posição)
    RandomUserModule,
  ],
  controllers: [PagamentoController],
})
export class AppModule {}