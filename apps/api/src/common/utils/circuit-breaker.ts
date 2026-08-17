export enum CircuitBreakerState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  cooldownPeriodMs: number; // Time to wait before attempting half-open
}

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(private options: CircuitBreakerOptions) {}

  public async fire<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() >= this.nextAttemptTime) {
        // Transition to HALF_OPEN to probe
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error('CircuitBreaker is OPEN. Fast-failing request.');
      }
    }

    try {
      const result = await action();
      // On success, reset the breaker
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.cooldownPeriodMs;
      // In a real app, emit an event or log to Datadog/Sentry here
      console.warn(`[CircuitBreaker] Circuit opened! Cooldown: ${this.options.cooldownPeriodMs}ms`);
    }
  }

  private reset() {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
  }
}
