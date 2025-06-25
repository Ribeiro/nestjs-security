import { ApiProperty } from "@nestjs/swagger";

export class PagamentoResponseDto {
  @ApiProperty({ example: 'Autorizado' })
  status!: string;

  @ApiProperty({ example: 1 })
  id!: number;
}
