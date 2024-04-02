/**
 * Seq Logger Options
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:50:10
 */
export interface SeqLoggerOptions {
  /**
   * The HTTP endpoint address of the Seq server
   * Optional, default value is http://localhost:5341
   */
  serverUrl: string;

  /**
   * The API Key to use when connecting to Seq
   */
  apiKey?: string;

  /**
   * App Service Name
   * Customize application name to facilitate log filtering
   */
  serviceName?: string;

  /**
   * This setting limits the size of the batch payload that Seq will attempt to parse and ingest at the logging endpoint.
   * Very large payloads can cause excessive CPU usage and timeouts during ingestion. Increasing this from the default value of 10485760 (10 MB) is not recommended. Instead, reduce the batch size in the client logging library.
   */
  batchPayloadLimit: number;

  /**
   * This setting limits the size of individual events that Seq will accept at the logging endpoint.
   * Very large events can cause significant performance problems. Increasing this from the default value of 262144 (256 KB) is not recommended. Instead, filter out large events in the client logging library.
   */
  eventBodyLimit: number;

  /**
   * The maximum number of times to retry sending events to Seq
   * Optional, default value is 5 (5 retries)
   */
  maxRetries: number;

  /**
   * The time to wait before retrying sending events to Seq
   * Optional, default value is 5 (5 seconds)
   */
  delay: number;

  /**
   * The maximum time to wait before timing out sending events to Seq
   * Optional, default value is 30 (30 seconds)
   */
  timeout: number;
}
