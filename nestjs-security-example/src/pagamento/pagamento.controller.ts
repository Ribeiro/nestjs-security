import { Controller, Post, Body, HttpException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { Antifraud } from "nestjs-security";
import { Pagamento } from "./pagamento.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreatePagamentoDto } from "./create-pagamento.dto";
import { PagamentoResponseDto } from "./response-create-pagamento.dto";

@ApiTags("Pagamentos")
@Controller("pagamentos")
export class PagamentoController {
  constructor(
    @InjectRepository(Pagamento)
    private readonly repo: Repository<Pagamento>
  ) {}

  @Post()
  @ApiOperation({ summary: "Autoriza pagamento com antifraude" })
  @ApiBody({ type: CreatePagamentoDto })
  @ApiResponse({
    status: 201,
    description: "Pagamento autorizado",
    type: PagamentoResponseDto,
  })
  @Antifraud({ key: "pagamentos.create", limit: 1, duration: 60 })
  async autorizar(
    @Body() dto: CreatePagamentoDto
  ): Promise<PagamentoResponseDto> {
    const saved = await this.repo.save(dto);
    return { status: "Autorizado", id: saved.id };
  }

  @Post("erro")
  getErro() {
    throw new HttpException("Erro manual", 400);
  }
}
