"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_jest_1 = require("./is-jest");
describe('IS_JEST runtime guard', () => {
    it('should be true when running inside Jest', () => {
        expect(is_jest_1.IS_JEST).toBe(true);
    });
    it('should be derived from JEST_WORKER_ID env var', () => {
        expect(process.env.JEST_WORKER_ID).toBeDefined();
    });
});
//# sourceMappingURL=is-jest.spec.js.map