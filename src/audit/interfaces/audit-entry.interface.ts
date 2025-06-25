export interface AuditEntry {
  entityName: string;
  entityId: string;
  revision: number;
  action: string;
  timestamp: Date;
  userId?: string;
  username?: string;
  diff?: Record<string, any>;
  data: any;
  ip?: string;
}
