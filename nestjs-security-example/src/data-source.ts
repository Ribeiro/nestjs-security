import { DataSource } from 'typeorm';
import { Pagamento } from './pagamento/pagamento.entity';
import * as dotenv from 'dotenv';
import { HttpCallAudit } from './http-call/http-call-audit.entity';
import { AntiFraudAudit } from './anti-fraud/anti-fraud.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.SECURITY_DB_HOST,
  port: parseInt(process.env.SECURITY_DB_PORT ?? '5432', 10),
  username: process.env.SECURITY_DB_USERNAME,
  password: process.env.SECURITY_DB_PASSWORD,
  database: process.env.SECURITY_DB_NAME,
  synchronize: false,
  entities: [Pagamento, HttpCallAudit, AntiFraudAudit],
  migrations: ['src/migrations/*.ts'],
});
