import { ApiProperty } from '@nestjs/swagger';

export class CreatePagamentoDto {
  @ApiProperty({
    description: 'CPF do pagador',
    example: '12345678900',
  })
  cpf!: string;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 150.75,
  })
  valor!: number;
}
