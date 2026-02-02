/**
 * Runtime guard: true when running inside a Jest worker.
 * Used to disable @Cron decorators during tests, preventing
 * open handles and spurious DB-access logs.
 */
export declare const IS_JEST: boolean;
//# sourceMappingURL=is-jest.d.ts.map