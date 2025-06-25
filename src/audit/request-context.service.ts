import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export interface RequestContext {
  userId?: string;
  username?: string;
  ip?: string;
}

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  run(ctx: RequestContext, cb: () => void) {
    this.als.run(ctx, cb);
  }

  getContext(): RequestContext | undefined {
    return this.als.getStore();
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly ctx: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const u = (req as any).user;
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      undefined;

    this.ctx.run(
      {
        userId: u?.id,
        username: u?.username,
        ip,
      },
      next,
    );
  }
}
