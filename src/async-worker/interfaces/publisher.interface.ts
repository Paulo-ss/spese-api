import { RedisMessage, StreamName } from '../types/messages-definition';

interface IPublishToStream {
  streamName: StreamName;
  message: RedisMessage<StreamName>;
}

export interface IPublisher {
  publishToStream: (publishToStream: IPublishToStream) => Promise<string>;
}
