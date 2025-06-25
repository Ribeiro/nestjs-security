/*#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import { AuditMigrationCommand } from '../tools/audit-migration.command';

async function bootstrap() {
  await CommandFactory.run(AuditMigrationCommand, {
    errorHandler: (err) => {
      console.error('Erro ao executar audit:migration:', err);
      process.exit(1);
    },
  });
}

bootstrap();
*/
