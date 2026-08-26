import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // Generate request ID
    req.id = uuid();

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent');
    const user = (req as any).user?.email || 'Anonymous';

    const startTime = Date.now();

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength} - ${user} - ${ip} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage, userAgent);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, userAgent);
      } else {
        this.logger.log(logMessage, userAgent);
      }
    });

    next();
  }
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
