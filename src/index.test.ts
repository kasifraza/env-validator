import { validateEnv, EnvValidationError } from './index';

describe('validateEnv', () => {
  it('validates required string', () => {
    const result = validateEnv({ API_KEY: { type: 'string' } }, { API_KEY: 'abc' });
    expect(result.API_KEY).toBe('abc');
  });

  it('throws on missing required var', () => {
    expect(() => validateEnv({ DB_URL: { type: 'string' } }, {}))
      .toThrow(EnvValidationError);
  });

  it('uses default when not set', () => {
    const result = validateEnv({ PORT: { type: 'number', default: 3000 } }, {});
    expect(result.PORT).toBe(3000);
  });

  it('coerces number', () => {
    const result = validateEnv({ PORT: { type: 'number' } }, { PORT: '8080' });
    expect(result.PORT).toBe(8080);
  });

  it('throws on invalid number', () => {
    expect(() => validateEnv({ PORT: { type: 'number' } }, { PORT: 'abc' }))
      .toThrow('Cannot convert');
  });

  it('coerces boolean true', () => {
    const result = validateEnv({ DEBUG: { type: 'boolean' } }, { DEBUG: 'true' });
    expect(result.DEBUG).toBe(true);
  });

  it('coerces boolean false', () => {
    const result = validateEnv({ DEBUG: { type: 'boolean' } }, { DEBUG: 'no' });
    expect(result.DEBUG).toBe(false);
  });

  it('parses JSON', () => {
    const result = validateEnv({ CFG: { type: 'json' } }, { CFG: '{"a":1}' });
    expect(result.CFG).toEqual({ a: 1 });
  });

  it('parses array', () => {
    const result = validateEnv({ HOSTS: { type: 'array' } }, { HOSTS: 'a, b, c' });
    expect(result.HOSTS).toEqual(['a', 'b', 'c']);
  });

  it('validates choices', () => {
    expect(() => validateEnv(
      { ENV: { type: 'string', choices: ['dev', 'prod'] as const } },
      { ENV: 'staging' }
    )).toThrow('must be one of');
  });

  it('passes valid choice', () => {
    const result = validateEnv(
      { ENV: { type: 'string', choices: ['dev', 'prod'] as const } },
      { ENV: 'prod' }
    );
    expect(result.ENV).toBe('prod');
  });

  it('applies custom transform', () => {
    const result = validateEnv(
      { URL: { transform: (v) => v.replace(/\/$/, '') } },
      { URL: 'http://api.com/' }
    );
    expect(result.URL).toBe('http://api.com');
  });

  it('allows optional vars to be undefined', () => {
    const result = validateEnv({ OPT: { type: 'string', required: false } }, {});
    expect(result.OPT).toBeUndefined();
  });

  it('collects multiple errors', () => {
    try {
      validateEnv({ A: { type: 'string' }, B: { type: 'number' } }, {});
    } catch (e: any) {
      expect(e.errors).toHaveLength(2);
    }
  });
});
