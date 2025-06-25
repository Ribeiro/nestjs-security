import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('http_call_audit')
export class HttpCallAudit {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('integer')
  revision!: number;

  @Column('text')
  @Index('IDX_HTTP_CALL_AUDIT_ENTITY_ID')
  entity_id!: string;

  @Column('text')
  action!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index('IDX_HTTP_CALL_AUDIT_TIMESTAMP')
  timestamp!: Date;

  @Column('text', { nullable: true })
  user_id!: string;

  @Column('text', { nullable: true })
  username!: string;

  @Column('jsonb', { nullable: true })
  diff: any;

  @Column('jsonb', { nullable: true })
  data: any;

  @Column('text', { nullable: true })
  ip!: string;
}