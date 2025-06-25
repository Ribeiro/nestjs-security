import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { isAuditable } from '../decorators/auditable.decorator';
import { AuditService } from './audit.service';
import { RequestContextService } from './request-context.service';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<any> {
  constructor(
    private readonly auditService: AuditService,
    private readonly ctx: RequestContextService,
  ) {}

  listenTo() {
    return Object;
  }

  async afterInsert(e: InsertEvent<any>) {
    await this.process(e, 'CREATE', null, e.entity);
  }

  async afterUpdate(e: UpdateEvent<any>) {
    await this.process(e, 'UPDATE', e.databaseEntity, e.entity);
  }

  async afterRemove(e: RemoveEvent<any>) {
    await this.process(e, 'DELETE', e.databaseEntity, null);
  }

  private async process(ev: any, action: string, before: any, after: any) {
    const ent = after ?? before;
    if (!ent || !isAuditable(ent)) return;

    const md = ev.metadata;
    const name = md.tableName;
    const id = String(ent[md.primaryColumns[0].propertyName]);

    const rev = await this.auditService.nextRevision(name, id, ev.manager);
    const diff = this.auditService.computeDiff(before ?? {}, after ?? {});
    const ctx = this.ctx.getContext();

    await this.auditService.audit(
      {
        entityName: name,
        entityId: id,
        revision: rev,
        action,
        timestamp: new Date(),
        userId: ctx?.userId,
        username: ctx?.username,
        diff,
        data: after ?? before,
        ip: ctx?.ip,
      },
      ev.manager,
    );
  }
}
