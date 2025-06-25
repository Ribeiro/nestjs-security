import { DataSource } from 'typeorm';

export async function createAuditTableIfNotExists(ds: DataSource, table: string) {
  const r = await ds.query(`SELECT to_regclass($1)`, [table]);
  if (r[0]?.to_regclass) return;
  await ds.query(`
    CREATE TABLE \${table} (
      id SERIAL PRIMARY KEY,
      revision INTEGER NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id TEXT,
      username TEXT,
      diff JSONB,
      data JSONB,
      ip TEXT
    );
  `);
}
