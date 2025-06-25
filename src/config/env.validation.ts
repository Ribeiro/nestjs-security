import { z } from 'zod';

export const securityEnvSchema = z.object({
  // Postgres para auditoria
  SECURITY_DB_HOST: z.string().min(1),
  SECURITY_DB_PORT: z.coerce.number().int().positive(),
  SECURITY_DB_USERNAME: z.string().min(1),
  SECURITY_DB_PASSWORD: z.string().min(1),
  SECURITY_DB_NAME: z.string().min(1),

  // Redis antifraude
  SECURITY_REDIS_HOST: z.string().min(1),
  SECURITY_REDIS_PORT: z.coerce.number().int().positive(),

  NODE_ENV: z.string().min(3)
});

export type SecurityEnv = z.infer<typeof securityEnvSchema>;
