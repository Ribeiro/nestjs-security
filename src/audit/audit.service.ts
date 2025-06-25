import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, DataSource } from 'typeorm';
import { AuditEntry } from './interfaces/audit-entry.interface';
import { AUDIT_CONNECTION } from '../tokens';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AUDIT_CONNECTION) private readonly ds: DataSource,
  ) {}

  async nextRevision(entityName: string, entityId: string, manager: EntityManager) {
    const r = await manager.query(
      `SELECT max(revision) as rev FROM ${entityName}_audit WHERE entity_id = $1`,
      [entityId],
    );
    return (r[0]?.rev ?? 0) + 1;
  }

  computeDiff(b: any, a: any) {
    const diff: any = {};
    const keys = new Set([...Object.keys(b ?? {}), ...Object.keys(a ?? {})]);
    keys.forEach(k => {
      if (JSON.stringify(b?.[k]) !== JSON.stringify(a?.[k])) {
        diff[k] = { before: b?.[k] ?? null, after: a?.[k] };
      }
    });
    return Object.keys(diff).length ? diff : undefined;
  }

  async audit(data: AuditEntry, manager?: EntityManager): Promise<void> {
    const mgr = manager ?? this.ds.manager;
    await mgr.query(
      `INSERT INTO ${data.entityName}_audit (revision, entity_id, action, timestamp, user_id, username, diff, data, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        data.revision,
        data.entityId,
        data.action,
        data.timestamp,
        data.userId,
        data.username,
        JSON.stringify(data.diff),
        JSON.stringify(data.data),
        data.ip,
      ],
    );
  }
}
