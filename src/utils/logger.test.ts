import { Logger, LogLevel } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should log error with LL prefix', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    Logger.error('Test error message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[LL][ERROR] Test error message');
  });

  test('should log warning with LL prefix', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    Logger.warn('Test warning message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[LL][WARN] Test warning message');
  });

  test('should log info with LL prefix', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    Logger.info('Test info message');
    
    expect(consoleSpy).toHaveBeenCalledWith('[LL][INFO] Test info message');
  });

  test('should have correct log levels', () => {
    expect(LogLevel.ERROR).toBe(0);
    expect(LogLevel.WARN).toBe(1);
    expect(LogLevel.INFO).toBe(2);
    expect(LogLevel.DEBUG).toBe(3);
  });
});