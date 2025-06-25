import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Inject,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { ANTIFRAUD_META_KEY } from "./antifraud.constants";
import Redis from "ioredis";
import { AntifraudOptions } from "../decorators/antifraud.decorator";
import { ANTI_FRAUD, RATE_LIMIT_EXCEEDED, REDIS_CLIENT } from "../tokens";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AntifraudInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AntifraudInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly auditService: AuditService
  ) {
    this.logger.log("AntifraudInterceptor successfully registered!");
  }

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const handler = context.getHandler();

    const options = this.reflector.get<AntifraudOptions>(
      ANTIFRAUD_META_KEY,
      handler
    );

    if (!options) {
      this.logger.debug("No @Antifraud metadata found. Continuing...");
      return next.handle();
    }

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
      req.ip;
    const key = `${options.key}:${ip}`;

    const limiter = new RateLimiterRedis({
      storeClient: this.redis,
      points: options.limit,
      duration: options.duration,
      keyPrefix: `antifraud:${options.key}`,
    });

    this.logger.debug(`Trying to consume point for key: "${key}"`);

    try {
      const result = await limiter.consume(key);
      this.logger.debug(`Point consumed. Remaining: ${result.remainingPoints}`);
      return next.handle();
    } catch {
      this.logger.warn(`Requests limit exceeded for key: "${key}"`);

      const auditEntry = {
            entityName: ANTI_FRAUD,
            entityId: key,
            action: RATE_LIMIT_EXCEEDED,
            revision: 1,
            timestamp: new Date(),
            userId: req.user?.id,
            username: req.user?.username,
            ip: ip,
            data: {
              request: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body
              }
            },
          };

      await this.auditService.audit(auditEntry);

      throw new HttpException(
        {
          statusCode: 429,
          message: "Limite de requisições excedido.",
        },
        429
      );
    }
  }
}
