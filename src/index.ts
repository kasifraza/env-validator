export type EnvType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface EnvRule {
  type?: EnvType;
  required?: boolean;
  default?: unknown;
  choices?: readonly unknown[];
  transform?: (value: string) => unknown;
}

export type EnvSchema = Record<string, EnvRule>;

type InferType<T extends EnvRule> =
  T['type'] extends 'number' ? number :
  T['type'] extends 'boolean' ? boolean :
  T['type'] extends 'json' ? unknown :
  T['type'] extends 'array' ? string[] :
  string;

export type ValidatedEnv<S extends EnvSchema> = {
  [K in keyof S]: InferType<S[K]>;
};

export class EnvValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Environment validation failed:\n  - ${errors.join('\n  - ')}`);
    this.name = 'EnvValidationError';
  }
}

function coerce(value: string, type: EnvType): unknown {
  switch (type) {
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot convert "${value}" to number`);
      return n;
    }
    case 'boolean':
      return ['true', '1', 'yes'].includes(value.toLowerCase());
    case 'json':
      return JSON.parse(value);
    case 'array':
      return value.split(',').map(s => s.trim());
    default:
      return value;
  }
}

export function validateEnv<S extends EnvSchema>(
  schema: S,
  env: Record<string, string | undefined> = process.env
): ValidatedEnv<S> {
  const result: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    const raw = env[key];

    if (raw === undefined || raw === '') {
      if (rule.default !== undefined) {
        result[key] = rule.default;
        continue;
      }
      if (rule.required !== false) {
        errors.push(`${key} is required but not set`);
        continue;
      }
      result[key] = undefined;
      continue;
    }

    try {
      let value: unknown;
      if (rule.transform) {
        value = rule.transform(raw);
      } else {
        value = coerce(raw, rule.type || 'string');
      }

      if (rule.choices && !rule.choices.includes(value)) {
        errors.push(`${key} must be one of [${rule.choices.join(', ')}], got "${value}"`);
        continue;
      }

      result[key] = value;
    } catch (e: any) {
      errors.push(`${key}: ${e.message}`);
    }
  }

  if (errors.length > 0) {
    throw new EnvValidationError(errors);
  }

  return result as ValidatedEnv<S>;
}
