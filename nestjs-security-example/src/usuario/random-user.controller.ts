import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RandomUserService } from './random-user.service';
import { RandomUserResponseDto } from './random-user.response.dto';

@ApiTags('Random User')
@Controller('random-user')
export class RandomUserController {
  constructor(private readonly service: RandomUserService) {}

  @Get()
  @ApiOperation({ summary: 'Busca um usuário aleatório da API randomuser.me' })
  @ApiResponse({
    status: 200,
    description: 'Usuário aleatório retornado com sucesso',
    type: RandomUserResponseDto,
  })
  async fetch(): Promise<RandomUserResponseDto> {
    return this.service.getRandomUser();
  }
}
