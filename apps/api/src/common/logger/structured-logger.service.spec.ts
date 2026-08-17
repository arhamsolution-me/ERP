import { StructuredLoggerService } from './structured-logger.service';

describe('StructuredLoggerService Unit Tests', () => {
  let logger: StructuredLoggerService;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new StructuredLoggerService();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('should format info logs as JSON string with timestamp and level', () => {
    logger.log('Server started', 'Bootstrap');
    expect(stdoutSpy).toHaveBeenCalled();
    const loggedJson = JSON.parse(stdoutSpy.mock.calls[0][0]);
    expect(loggedJson.level).toBe('INFO');
    expect(loggedJson.context).toBe('Bootstrap');
    expect(loggedJson.message).toBe('Server started');
    expect(loggedJson.timestamp).toBeDefined();
  });

  it('should write error logs to stderr with trace', () => {
    logger.error('Database failure', 'ErrorStack...', 'DatabaseModule');
    expect(stderrSpy).toHaveBeenCalled();
    const loggedJson = JSON.parse(stderrSpy.mock.calls[0][0]);
    expect(loggedJson.level).toBe('ERROR');
    expect(loggedJson.message).toBe('Database failure');
    expect(loggedJson.trace).toBe('ErrorStack...');
  });
});
