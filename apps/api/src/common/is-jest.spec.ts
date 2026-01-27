import { IS_JEST } from './is-jest';

describe('IS_JEST runtime guard', () => {
  it('should be true when running inside Jest', () => {
    expect(IS_JEST).toBe(true);
  });

  it('should be derived from JEST_WORKER_ID env var', () => {
    expect(process.env.JEST_WORKER_ID).toBeDefined();
  });
});
