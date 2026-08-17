import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker(2, 50); // small numbers for fast testing
  });

  it('should be closed initially', () => {
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should open after failure threshold is reached', () => {
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');
  });

  it('should transition to half-open after timeout', (done) => {
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe('OPEN');

    setTimeout(() => {
      expect(breaker.getState()).toBe('HALF_OPEN');
      done();
    }, 60);
  });

  it('should reset to closed if successful while half-open', (done) => {
    breaker.recordFailure();
    breaker.recordFailure();

    setTimeout(() => {
      expect(breaker.getState()).toBe('HALF_OPEN');
      breaker.recordSuccess();
      expect(breaker.getState()).toBe('CLOSED');
      done();
    }, 60);
  });
});
