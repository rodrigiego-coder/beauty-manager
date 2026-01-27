/**
 * Runtime guard: true when running inside a Jest worker.
 * Used to disable @Cron decorators during tests, preventing
 * open handles and spurious DB-access logs.
 */
export const IS_JEST = !!process.env.JEST_WORKER_ID;
