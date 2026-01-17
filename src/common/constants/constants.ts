export const ASYNC_WORKER = {
    REDIS_STREAMS: {
        EXPENSE_CREATED: 'expense:created',
        EXPENSE_UPDATED: 'expense:updated',
        EXPENSE_DELETED: 'expense:deleted',
        INCOME_CREATED: 'income:created',
        INCOME_UPDATED: 'income:updated',
        INCOME_DELETED: 'income:deleted',
        REPORT_PROCESSING: 'report:processing',
    },
    REDIS_GROUPS: {
        EXPENSE_CREATED: 'expense_created',
        EXPENSE_UPDATED: 'expense_updated',
        EXPENSE_DELETED: 'expense_deleted',
        INCOME_CREATED: 'income_created',
        INCOME_UPDATED: 'income_updated',
        INCOME_DELETED: 'income_deleted',
        REPORT_PROCESSING: 'report_processing',
    },
    REDIS_ENTRY_IDS: {
        NEW_ENTRY: '*',
        LAST_ENTRY: '$',
        UNRECEIVED_ENTRY: '>',
        PENDING_ENTRY: '0-0',
    },
    ACK_SUCCESS: 1,
} as const;

export const DEPENDENCY_INJECTION_PROVIDERS = {
    ASYNC_WORKER_SUBSCRIBERS: 'ASYNC_WORKER_SUBSCRIBERS',
    EXTERNAL_OAUTH_PROVIDERS: 'EXTERNAL_OAUTH_PROVIDERS',
} as const;
