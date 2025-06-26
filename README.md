# nestjs-security

Biblioteca modular para auditoria, antifraude e interceptação de chamadas HTTP em aplicações NestJS.

## ✨ Funcionalidades

- **Auditoria de entidades** via eventos do TypeORM.
- **Interceptor Antifraude** com controle de IPs e CPFs suspeitos.
- **Interceptor Axios com auditoria automática** de chamadas externas.
- **Decorators reutilizáveis** para marcação de métodos auditáveis.
- Suporte a **NestJS 9+**, **TypeORM**, **PostgreSQL** e **Redis**.

## 📦 Instalação

 - Executar os scripts no arquivo init.sql para criação das tabelas de auditoria (Axios e Antifraude)

```bash
yarn add nestjs-security
```
## Durante o desenvolvimento local, utilize:
```bash
yarn link
yarn link nestjs-security
```

## Importação no AppModule:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule, AntifraudModule, AxiosAuditModule } from 'nestjs-security';

import { PagamentoController } from './pagamento/pagamento.controller';
import { Pagamento } from './pagamento/pagamento.entity';
import { RandomUserModule } from './usuario/random-user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
      cache: true,
    }),

    AuditModule.forRoot(),   // Inicializa primeiro - conexão de auditoria
    AntifraudModule,        // Depende do Redis e AuditService
    AxiosAuditModule,       // Depende do AuditService

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
        poolSize: 10, 
        extra: {
          connectionTimeoutMillis: 2000,
        }
      }),
    }),

    TypeOrmModule.forFeature([Pagamento]),

    RandomUserModule,
  ],
  controllers: [PagamentoController],
})
export class AppModule {}
```

## Auditoria de Entidades - em caso de insert/update/delete armazena inclusive o diff em tabela de auditoria usando um subscriber do TypeORM

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Auditable } from 'nestjs-security';

@Auditable()
@Entity()
export class Pagamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cpf!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: number;
}
```

## Exemplo de config no main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import {
  RequestContextMiddleware,
  AntifraudInterceptor,
} from 'nestjs-security';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Middleware para uso com o AxiosAuditInterceptor - RequestContextService
  const requestContextMiddleware = app.get(RequestContextMiddleware);
  app.use(requestContextMiddleware.use.bind(requestContextMiddleware));

  setupSwagger(app); 
  app.useGlobalFilters(new AllExceptionsFilter());

  //Interceptor do Antifraude
  app.useGlobalInterceptors(app.get(AntifraudInterceptor));

  await app.listen(3000);
  console.log(`🚀 App started at http://localhost:3000`);
}
bootstrap();
```


## Decorator Antifraude - bane o IP por tempo configurado via Redis e armazena o evento no Postgres com os dados do usuário e IP

```typescript
import { Controller, Post, Body, HttpException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { Antifraud } from "nestjs-security";
import { Pagamento } from "./pagamento.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePagamentoDto } from "./create-pagamento.dto";
import { PagamentoResponseDto } from "./response-create-pagamento.dto";

@ApiTags("Pagamentos")
@Controller("pagamentos")
export class PagamentoController {
  constructor(
    @InjectRepository(Pagamento)
    private readonly repo: Repository<Pagamento>
  ) {}

  @Post()
  @ApiOperation({ summary: "Autoriza pagamento com antifraude" })
  @ApiBody({ type: CreatePagamentoDto })
  @ApiResponse({
    status: 201,
    description: "Pagamento autorizado",
    type: PagamentoResponseDto,
  })
  @Antifraud({ key: "pagamentos.create", limit: 1, duration: 60 })
  async autorizar(
    @Body() dto: CreatePagamentoDto
  ): Promise<PagamentoResponseDto> {
    const saved = await this.repo.save(dto);
    return { status: "Autorizado", id: saved.id };
  }

  @Post("erro")
  getErro() {
    throw new HttpException("Erro manual", 400);
  }
}
```

## Interceptor Axios com Auditoria - Armazena request/response/error no Postgres com os dados do usuário e IP

```typescript
constructor(private readonly axiosAudit: AxiosAuditInterceptor) {}

async fetchUser() {
  const response = await this.axiosAudit.instance.get('https://gov.br/api');
  return response.data;
}
```


## Estrutura do Projeto

```text
nestjs-security/
├── audit/               # Auditoria via TypeORM
│   ├── audit.module.ts
│   ├── audit.service.ts
│   └── ...
├── antifraud/           # Interceptor antifraude
├── axios/               # Interceptor Axios
├── decorators/          # Decorators auditáveis/antifraude
├── common/              # Utilitários internos
├── .gitignore
├── package.json
└── tsconfig.json
```


🛠️ Requisitos:

* Node.js >= 20
* NestJS >= 9
* TypeORM >= 0.3.x
* PostgreSQL
* Redis (opcional para antifraude)

## Projeto exemplo

 - Você encontra na pasta nestjs-security-example desde repo.

