import { Module } from '@nestjs/common';
import { RandomUserController } from './random-user.controller';
import { RandomUserService } from './random-user.service';
import { AxiosAuditModule } from 'nestjs-security';

@Module({
  imports: [AxiosAuditModule],
  controllers: [RandomUserController],
  providers: [RandomUserService],
})
export class RandomUserModule {}
