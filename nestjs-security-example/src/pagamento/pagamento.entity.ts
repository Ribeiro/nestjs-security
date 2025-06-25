import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Auditable } from 'nestjs-security';

@Auditable()
@Entity()
export class Pagamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cpf!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor!: number;
}
