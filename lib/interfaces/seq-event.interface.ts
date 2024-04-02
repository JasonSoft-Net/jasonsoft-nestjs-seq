import { SeqLevel } from '../enums';

export interface SeqEvent {
  Timestamp: Date;
  Level: SeqLevel;
  MessageTemplate: string;
  Exception?: string;
  Properties?: Record<string, any>;
}
