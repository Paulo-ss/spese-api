import { IBaseMessage } from '../types/messages';
import { StreamName } from '../types/redis';

interface IPublishToStream<TMessage extends IBaseMessage> {
  streamName: StreamName;
  message: TMessage;
}

export interface IPublisher<TMessage extends IBaseMessage> {
  publishToStream: (
    publishToStream: IPublishToStream<TMessage>,
  ) => Promise<string | unknown>;
}
