import * as os from 'os';
import axios from 'axios';
import { SeqEvent, SeqLoggerOptions } from '../interfaces';
import { EventCollection } from '../utils/event-collection.util';
import { sleep } from '../utils/sleep.util';
import { NETWORK_ERRORS } from '../seq-logger.constants';
import { logToConsole, safeStringify } from '../utils';
import { SeqLevel } from '../enums';

/**
 * Core logger class responsible for managing and sending log events to Seq server.
 * Added by Jason.Song (成长的小猪) on 2023/11/18
 */
export class SeqLoggerCore {
  options: SeqLoggerOptions;
  metaProperties: Record<string, any>;
  private isInitEvent: boolean = false;
  private events: EventCollection<SeqEvent> = new EventCollection<SeqEvent>();
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | undefined;
  private readonly START_TAG = '{"Events":[';
  private readonly END_TAG = ']}';
  private readonly TAG_LENGTH =
    Buffer.byteLength(this.START_TAG) + Buffer.byteLength(this.END_TAG);

  /**
   * Initializes the logger with provided options, merging them with default values.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   * @param options Partial configuration options for the logger.
   */
  constructor(options: Partial<SeqLoggerOptions>) {
    this.options = this.mergeOptionsWithDefaults(options);
    this.metaProperties = {
      hostname: os.hostname(),
      serviceName: this.options.serviceName,
      ...this.options.extendMetaProperties,
      logger: 'seq',
    };
    this.isRunning = true;
  }

  /**
   * Merges user-provided options with default logger options.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   * @param options Partial configuration options for the logger.
   * @returns Complete configuration options for the logger.
   */
  private mergeOptionsWithDefaults(
    options: Partial<SeqLoggerOptions>,
  ): SeqLoggerOptions {
    const defaultOptions: SeqLoggerOptions = {
      serverUrl: 'http://localhost:5341',
      batchPayloadLimit: 10485760,
      eventBodyLimit: 262144,
      maxRetries: 5,
      delay: 5,
      timeout: 30,
      metaFieldName: 'meta',
    };
    return { ...defaultOptions, ...options };
  }

  /**
   * Emits a log event, adding it to the queue and starting the send process if not already running.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   * @param event The log event to emit.
   */
  public emit(event: SeqEvent) {
    if (!this.isRunning) {
      return;
    }
    this.events.add(event);
    this.start(2000);
  }

  /**
   * Starts the send process after a delay, if it's not already started.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   * @param ms Delay in milliseconds before starting the send process.
   */
  private start(ms: number = 0) {
    if (this.timer) {
      return;
    }
    this.timer = setTimeout(() => this.send(), ms);
  }

  /**
   * Stops the send process by clearing the timer.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   */
  private stop() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  /**
   * Sends log events to the Seq server in batches, respecting payload limits and retrying on failure.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   */
  private async send(): Promise<void> {
    const { batchPayloadLimit, eventBodyLimit } = this.options;
    let contentLen = this.TAG_LENGTH;
    const contentArray: string[] = [];
    while (this.events.size() > 0) {
      const event = this.events.get(0);
      if (!event) {
        break;
      }
      let jsonStr = safeStringify(event);
      let jsonLen = Buffer.byteLength(jsonStr);
      if (jsonLen > eventBodyLimit) {
        logToConsole(
          'warn',
          `Event body is larger than ${eventBodyLimit} bytes: ${jsonLen}`,
        );
        const correctEvent = this.handleLargeEvent(
          event,
          jsonLen,
          eventBodyLimit,
        );
        jsonStr = safeStringify(correctEvent);
        jsonLen = Buffer.byteLength(jsonStr);
      }
      if (contentLen + jsonLen > batchPayloadLimit) {
        break;
      }
      contentArray.push(jsonStr);
      contentLen += jsonLen;
      this.events.remove(0);
    }

    if (contentArray.length > 0) {
      const content = `${this.START_TAG}${contentArray.join(',')}${
        this.END_TAG
      }`;
      for (const times of [...Array(this.options.maxRetries).keys()]) {
        try {
          const url = `${this.options.serverUrl.replace(
            /\/?$/,
            '',
          )}/api/events/raw`;
          await axios.post(url, content, {
            headers: {
              'Content-Type': 'application/json',
              'X-Seq-ApiKey': this.options.apiKey,
              'Content-Length': Buffer.byteLength(content),
            },
            timeout: this.options.timeout * 1000,
          });
          if (!this.isInitEvent) {
            this.isInitEvent = true;
            logToConsole('log', 'Seq logger initialized successfully');
            this.emit({
              Timestamp: new Date(),
              Level: SeqLevel.Information,
              MessageTemplate: `[{context}] Seq logger initialized successfully`,
              Properties: {
                context: 'jasonsoft/nestjs-seq',
                [this.options.metaFieldName]: this.metaProperties,
              },
            });
          }
          break;
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            let data = error.message;
            if (error.response) {
              const { status, data: body } = error.response;
              if (body.Error) {
                data = body.Error;
              }
              if (status >= 500 && status <= 599) {
                logToConsole(
                  'error',
                  `Server error, retrying(${times + 1}) in ${this.options.delay} seconds`,
                );
                if (times < this.options.maxRetries - 1) {
                  await sleep(this.options.delay);
                  continue;
                }
              }
            }
            if (error.code && NETWORK_ERRORS.includes(error.code)) {
              logToConsole(
                'error',
                `Network error, retrying(${times + 1}) in ${this.options.delay} seconds`,
              );
              if (times < this.options.maxRetries - 1) {
                await sleep(this.options.delay);
                continue;
              }
            }
            logToConsole(
              'error',
              `Failed to send log due to: ${data || error.code}`,
            );
          } else {
            logToConsole('error', error.message, error.stack);
          }
          break;
        }
      }
    }

    if (this.events.size() > 0) {
      await this.send();
    } else {
      this.stop();
    }
  }

  /**
   * Handles events that exceed the body limit by creating a new event indicating the original message was too large.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   * @param event The original event that exceeded the body limit.
   * @param currentBodyLen The length of the original event's body.
   * @param eventBodyLimit The maximum allowed body length.
   * @returns A new event indicating the original message was too large.
   */
  private handleLargeEvent(
    event: SeqEvent,
    currentBodyLen: number,
    eventBodyLimit: number,
  ): SeqEvent {
    const partialMessage = event.MessageTemplate?.substring(0, 50);
    return {
      Timestamp: event.Timestamp,
      Level: event.Level,
      MessageTemplate: `[{context}] - (Log too large) ${partialMessage}...`,
      Properties: {
        serviceName: this.options.serviceName,
        context: 'jasonsoft/nestjs-seq',
        hostname: event.Properties?.hostname,
        logger: event.Properties?.logger,
        message: `Event body is larger than ${eventBodyLimit} bytes: ${currentBodyLen}`,
      },
    };
  }

  /**
   * Closes the logger, stopping any ongoing send processes and marking the logger as not running.
   * Added by Jason.Song (成长的小猪) on 2023/11/18
   */
  public close() {
    if (!this.isRunning) {
      logToConsole('warn', 'Logger is already closed');
      return;
    }
    this.isRunning = false;
    this.start();
  }
}
