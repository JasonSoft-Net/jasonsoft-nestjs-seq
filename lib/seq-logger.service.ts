import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { JASONSOFT_SEQ_LOGGER } from './seq-logger.constants';
import * as os from 'os';
import { SeqLevel } from './enums/seq-level.enum';
import { SeqLoggerCore } from './core';
import { getTimestamp } from './utils';
import { SeqEvent } from './interfaces';

/**
 * Seq logger service for sending log messages to Seq.
 * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:18:37
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:59:39
 */
@Injectable()
export class SeqLogger implements OnApplicationShutdown {
  constructor(
    @Inject(JASONSOFT_SEQ_LOGGER)
    private readonly seqLogger: SeqLoggerCore,
  ) {}

  /**
   * Logs a verbose message with optional properties.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:18:52
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  public verbose(messageTemplate: string, properties?: object): void {
    this.commit(SeqLevel.Verbose, messageTemplate, properties);
  }

  /**
   * Logs a debug message with optional properties.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:02
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  public debug(messageTemplate: string, properties?: object): void {
    this.commit(SeqLevel.Debug, messageTemplate, properties);
  }

  /**
   * Logs an informational message with optional properties.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:13
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  public info(messageTemplate: string, properties?: object): void {
    this.commit(SeqLevel.Information, messageTemplate, properties);
  }

  /**
   * Logs a warning message with optional properties.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:34
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  public warn(messageTemplate: string, properties?: object): void {
    this.commit(SeqLevel.Warning, messageTemplate, properties);
  }

  /**
   * Logs an error message with optional properties or message.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:46
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties or an Error object to log.
   */
  public error(messageTemplate: string): void;
  public error(properties: object | Error): void;
  public error(messageTemplate: string, properties: object | Error): void;
  public error(
    messageTemplateOrProperties: string | object | Error,
    properties?: object | Error,
  ): void {
    if (typeof messageTemplateOrProperties === 'string') {
      this.commit(
        SeqLevel.Error,
        messageTemplateOrProperties,
        properties as object,
      );
    } else {
      const messageTemplate =
        messageTemplateOrProperties instanceof Error
          ? messageTemplateOrProperties.message
          : '(No message provided)';
      this.commit(
        SeqLevel.Error,
        messageTemplate,
        messageTemplateOrProperties as object,
      );
    }
  }

  /**
   * Logs a fatal message with optional properties.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:03
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  public fatal(messageTemplate: string, properties?: object): void {
    this.commit(SeqLevel.Fatal, messageTemplate, properties);
  }

  /**
   * Commits the log message to the Seq logger.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:23
   * @param level The log level.
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  private commit(level: SeqLevel, messageTemplate: string, properties?: any) {
    const { stack, logger, ...props } = properties || {};
    const seqEvent: SeqEvent = {
      Timestamp: new Date(),
      Level: level,
      MessageTemplate: messageTemplate,
      Properties: {
        serviceName: this.seqLogger.options.serviceName,
        hostname: os.hostname(),
        logger: logger || 'seq',
        ...props,
      },
      Exception: stack ? stack : undefined,
    };
    try {
      this.seqLogger.emit(seqEvent);
    } catch (error) {
      console.error(
        `\x1b[31m[jasonsoft/nestjs-seq]\x1b[39m - \x1b[37m${getTimestamp()}\x1b[39m \x1b[31mERROR\x1b[39m \x1b[33m[SeqLogger]\x1b[39m`,
        error,
      );
    }
  }

  /**
   * Handles the application shutdown event.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:40
   * Added by Jason.Song (成长的小猪) on 2023/01/11 14:14:13
   * @param signal The signal received for the shutdown.
   */
  onApplicationShutdown(signal?: string) {
    console.log(signal);
    this.seqLogger.close();
  }
}
