import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('anti_fraud_audit')
export class AntiFraudAudit {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('integer')
  revision!: number;

  @Column('text')
  @Index('IDX_ANTI_FRAUD_AUDIT_ENTITY_ID')
  entity_id!: string;

  @Column('text')
  action!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index('IDX_ANTI_FRAUD_AUDIT_TIMESTAMP')
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