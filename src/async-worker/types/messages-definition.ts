import { ASYNC_WORKER } from 'src/common/constants/constants';

interface IBaseMessage {
  timestamp: Date | string;
  messageId?: string;
}

export interface IExpenseCreatedMessage extends IBaseMessage {
  expenseId: string;
  userId: string;
  value: number;
  description: string;
}

export type StreamName =
  (typeof ASYNC_WORKER.REDIS_STREAMS)[keyof typeof ASYNC_WORKER.REDIS_STREAMS];

export interface StreamMessageMap {
  [ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED]: IExpenseCreatedMessage;
}

export type RedisMessage<T extends StreamName> =
  T extends keyof StreamMessageMap ? StreamMessageMap[T] : never;

export type GroupName =
  (typeof ASYNC_WORKER.REDIS_GROUPS)[keyof typeof ASYNC_WORKER.REDIS_GROUPS];

export type StreamEntryId =
  (typeof ASYNC_WORKER.REDIS_ENTRY_IDS)[keyof typeof ASYNC_WORKER.REDIS_ENTRY_IDS];

export type StreamMessages = {
  name: string;
  messages: { id: string; message: { [x: string]: string } }[];
};
