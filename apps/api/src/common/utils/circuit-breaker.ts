export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownPeriodMs: number;
}

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private nextAttemptTime = 0;
  private options: CircuitBreakerOptions;

  constructor(optionsOrThreshold: number | CircuitBreakerOptions, cooldownMs?: number) {
    if (typeof optionsOrThreshold === 'number') {
      this.options = {
        failureThreshold: optionsOrThreshold,
        cooldownPeriodMs: cooldownMs || 5000,
      };
    } else {
      this.options = optionsOrThreshold;
    }
  }

  public getState(): CircuitBreakerState {
    if (this.state === CircuitBreakerState.OPEN && Date.now() >= this.nextAttemptTime) {
      this.state = CircuitBreakerState.HALF_OPEN;
    }
    return this.state;
  }

  public async fire<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === CircuitBreakerState.OPEN) {
      throw new Error('CircuitBreaker is OPEN. Fast-failing request.');
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  public recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.cooldownPeriodMs;
    }
  }

  public recordSuccess() {
    this.reset();
  }

  public reset() {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.nextAttemptTime = 0;
  }
}
