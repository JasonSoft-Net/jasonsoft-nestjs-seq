import { ConsoleLogger, Injectable } from '@nestjs/common';
import { SeqLogger } from './seq-logger.service';

/**
 * Nest system console logging to Seq through custom console logger
 * Added by Jason.Song (成长的小猪) on 2021-09-24 16:56:31
 * ```typescript
 *  import { NestFactory } from '@nestjs/core';
 *  import { AppModule } from './app.module';
 *  // Import the ConsoleSeqLogger from '@jasonsoft/nestjs-seq'
 *  import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
 *
 *  async function bootstrap() {
 *    // Set bufferLogs to true to ensure that all logs will be buffered until a custom logger (ConsoleSeqLogger) is attached.
 *    const app = await NestFactory.create(AppModule, {
 *      bufferLogs: true,
 *    });
 *    // Extend built-in logger
 *    app.useLogger(app.get(ConsoleSeqLogger));
 *
 *    await app.listen(3000);
 *  }
 *  bootstrap();
 * ```
 */
@Injectable()
export class ConsoleSeqLogger extends ConsoleLogger {
  constructor(private readonly logger: SeqLogger) {
    super();
  }

  log(message: any, context?: string): void {
    this.logger.info(`[{context}] ${message}`, { logger: 'console', context });
    super.log(message, context);
  }

  error(message: any, stack?: string, context?: string): void {
    this.logger.error(`[{context}] ${message}`, {
      logger: 'console',
      context,
      stack,
    });
    super.error(message, stack, context);
  }

  warn(message: any, context?: string): void {
    this.logger.warn(`[{context}] ${message}`, { logger: 'console', context });
    super.warn(message, context);
  }

  debug(message: any, context?: string): void {
    this.logger.debug(`[{context}] ${message}`, { logger: 'console', context });
    super.debug(message, context);
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(`[{context}] ${message}`, {
      logger: 'console',
      context,
    });
    super.verbose(message, context);
  }
}
