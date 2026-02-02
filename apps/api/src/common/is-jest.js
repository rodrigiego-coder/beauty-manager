"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_JEST = void 0;
/**
 * Runtime guard: true when running inside a Jest worker.
 * Used to disable @Cron decorators during tests, preventing
 * open handles and spurious DB-access logs.
 */
exports.IS_JEST = !!process.env.JEST_WORKER_ID;
//# sourceMappingURL=is-jest.js.map