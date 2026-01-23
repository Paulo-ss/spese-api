import { IBaseMessage } from '../types/messages';
import { IGroupConfig } from './group-config.interface';
import { GroupName, StreamName } from '../types/redis';

export interface ISubscriber<TMessage extends IBaseMessage> {
  groupName: GroupName;

  consumerName: string;

  totalConsumers: number;

  getGroupConfig(): IGroupConfig;

  getStreamName(): StreamName;

  onMessage(message: TMessage): Promise<void>;

  onError(
    error: Error,
    channel: string,
    messagePayload: TMessage | string,
  ): void;
}
