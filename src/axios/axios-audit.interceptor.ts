import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { RequestContextService } from '../audit/request-context.service';
import { AuditService } from '../audit/audit.service';
import { HTTP_CALL } from '../tokens';

interface InternalAxiosRequestWithMeta extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
}

@Injectable()
export class AxiosAuditInterceptor {
  private readonly axiosInstance: AxiosInstance;
  private readonly logger = new Logger(AxiosAuditInterceptor.name);

  // 🔧 Domínios permitidos para auditoria
  private readonly allowedHosts = ['serpro.gov.br', 'gov.br', 'randomuser.me'];

  constructor(
    private readonly ctx: RequestContextService,
    private readonly auditService: AuditService,
  ) {
    this.logger.log('Inicializando AxiosAuditInterceptor...');
    this.axiosInstance = axios.create();
    this.setupInterceptors();
  }

  get instance() {
    return this.axiosInstance;
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(config => {
      (config as InternalAxiosRequestWithMeta).metadata = {
        startTime: Date.now(),
      };
      this.logger.debug(`Intercepting request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      async response => {
        await this.auditHttpCall(response.config, response.status, response.data);
        return response;
      },
      async error => {
        if (error.config) {
          const status = error.response?.status ?? 0;
          const data = error.response?.data ?? error.message;
          await this.auditHttpCall(error.config, status, data);
        }
        return Promise.reject(error instanceof Error ? error : new Error(JSON.stringify(error)));
      },
    );
  }

  private async auditHttpCall(config: any, status: number, responseData: any) {
    const endTime = Date.now();
    const duration = endTime - (config.metadata?.startTime ?? endTime);
    const url = config.url ?? '';

    const shouldAudit = this.allowedHosts.some(host => url.includes(host));
    if (!shouldAudit) {
      this.logger.debug(`Request to URL "${url}" is not in allowed domains. Ignoring audit.`);
      return;
    }

    this.logger.debug(`Auditing started for "${url}" with status ${status}`);

    const context = this.ctx.getContext();

    const auditEntry = {
      entityName: HTTP_CALL,
      entityId: url,
      action: `${config.method?.toUpperCase()} ${status}`,
      revision: 1,
      timestamp: new Date(),
      userId: context?.userId,
      username: context?.username,
      ip: context?.ip,
      data: {
        request: {
          method: config.method,
          url,
          headers: config.headers,
          data: config.data,
        },
        response: {
          status,
          data: responseData,
          durationMs: duration,
        },
      },
    };

    try {
      await this.auditService.audit(auditEntry, config.manager ?? undefined);
      this.logger.log(`Audit ended for "${url}" with status ${status}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao auditar requisição para "${url}": ${err.message}`, err.stack);
    }
  }
}
