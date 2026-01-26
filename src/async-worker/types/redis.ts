import { ASYNC_WORKER } from 'src/common/constants/constants';

export type StreamName =
    (typeof ASYNC_WORKER.REDIS_STREAMS)[keyof typeof ASYNC_WORKER.REDIS_STREAMS];

export type GroupName =
    (typeof ASYNC_WORKER.REDIS_GROUPS)[keyof typeof ASYNC_WORKER.REDIS_GROUPS];

export type StreamEntryId =
    (typeof ASYNC_WORKER.REDIS_ENTRY_IDS)[keyof typeof ASYNC_WORKER.REDIS_ENTRY_IDS];

export type StreamMessages = {
    name: string;
    messages: { id: string; message: { [x: string]: string } }[];
};
