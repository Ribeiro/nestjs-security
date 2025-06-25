import { config as loadEnv } from 'dotenv';
import { securityEnvSchema, SecurityEnv } from './env.validation';

let cached: SecurityEnv;

export function loadAndValidateSecurityEnv(): SecurityEnv {
  if (cached) return cached;

  loadEnv();

  const result = securityEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment configuration:', result.error.format());
    throw new Error('Environment validation failed');
  }

  cached = result.data;
  return cached;
}
