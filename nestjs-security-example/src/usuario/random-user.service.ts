import { Injectable } from '@nestjs/common';
import { AxiosAuditInterceptor } from 'nestjs-security';

@Injectable()
export class RandomUserService {
  constructor(private readonly axiosAudit: AxiosAuditInterceptor) {}

  async getRandomUser(): Promise<any> {
    const response = await this.axiosAudit.instance.get('https://randomuser.me/api/');
    return response.data;
  }
}
