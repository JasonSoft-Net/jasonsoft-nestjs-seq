import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConsoleSeqLogger } from './console-seq-logger.service';
import {
  SeqLoggerAsyncOptions,
  SeqLoggerModuleOptions,
  SeqLoggerModuleOptionsFactory,
} from './interfaces';
import {
  JASONSOFT_SEQ_LOGGER,
  JASONSOFT_SEQ_LOGGER_OPTIONS,
} from './seq-logger.constants';
import { SeqLogger } from './seq-logger.service';
import { defaultIfNullOrUndefined, getTimestamp } from './utils';
import { SeqLevel } from './enums';
import { SeqLoggerCore } from './core';

/**
 * JasonSoft Seq logger Module
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class SeqLoggerModule {
  /**
   * Static configuration
   * Register a globally available configuration for seq logger service.
   * Added by Jason.Song (成长的小猪) on 2021/10/18 17:15:51
   * @param options Seq logger configuration object
   */
  static forRoot(options: SeqLoggerModuleOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: defaultIfNullOrUndefined(options.isGlobal, true),
      providers: [
        {
          provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
          useValue: options,
        },
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: () => {
            return this.createSeqLogger(options);
          },
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }

  /**
   * Async configuration
   * Register a globally available configuration for the seq logger service.
   * Added by Jason.Song (成长的小猪) on 2021/10/18 15:43:38
   * @param options Seq logger configuration async factory
   */
  static forRootAsync(options: SeqLoggerAsyncOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: defaultIfNullOrUndefined(options.isGlobal, true),
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: (config: SeqLoggerModuleOptions) => {
            return this.createSeqLogger(config);
          },
          inject: [JASONSOFT_SEQ_LOGGER_OPTIONS],
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }

  private static createSeqLogger(options: SeqLoggerModuleOptions) {
    console.info(
      `\x1b[33m[jasonsoft/nestjs-seq]\x1b[39m - \x1b[37m${getTimestamp()}\x1b[39m \x1b[32mLOG\x1b[39m \x1b[33m[SeqLogger]\x1b[39m \x1b[32mSeq Logger is initializing...\x1b[39m`,
    );
    const seqLogger = new SeqLoggerCore(options);
    seqLogger.emit({
      Timestamp: new Date(),
      Level: SeqLevel.Information,
      MessageTemplate: `[{context}] Seq Logger is initializing...`,
      Properties: {
        serviceName: options.serviceName,
        context: 'jasonsoft/nestjs-seq',
        SeqInitEvent: true,
      },
    });
    return seqLogger;
  }

  private static createAsyncProviders(
    options: SeqLoggerAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<SeqLoggerModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    asyncOptions: SeqLoggerAsyncOptions,
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || [],
      };
    }
    return {
      provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
      useFactory: async (optionsFactory: SeqLoggerModuleOptionsFactory) =>
        optionsFactory.createSeqLoggerOptions(),
      inject: [
        (asyncOptions.useClass ||
          asyncOptions.useExisting) as Type<SeqLoggerModuleOptionsFactory>,
      ],
    };
  }
}
