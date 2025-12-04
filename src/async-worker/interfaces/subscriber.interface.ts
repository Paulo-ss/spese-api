import { StreamName, RedisMessage } from '../types/messages-definition';
import { IGroupConfig } from './group-config.interface';
import { GroupName } from '../types/messages-definition';

export interface ISubscriber {
  groupName: GroupName;

  consumerName: string;

  getGroupConfig(): IGroupConfig;

  getStreamName(): StreamName;

  onMessage(message: RedisMessage<StreamName>): Promise<void>;

  onSubscribed(channel: string): void;

  onError(
    error: Error,
    channel: string,
    messagePayload: RedisMessage<StreamName> | string,
  ): void;
}
