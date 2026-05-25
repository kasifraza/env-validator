# @kasifraza/env-validator

Type-safe environment variable validation with defaults, coercion, and early failure. Zero dependencies.

## Install

```bash
npm install @kasifraza/env-validator
```

## Usage

```ts
import { validateEnv } from '@kasifraza/env-validator';

const config = validateEnv({
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'string' },
  REDIS_URL: { type: 'string' },
  ENABLE_CACHE: { type: 'boolean', default: true },
  NODE_ENV: { type: 'string', choices: ['development', 'production', 'test'] },
  ALLOWED_ORIGINS: { type: 'array', default: ['http://localhost:3000'] },
  AWS_CONFIG: { type: 'json', required: false },
});

// config is fully typed:
// config.PORT → number
// config.DATABASE_URL → string
// config.ENABLE_CACHE → boolean
// config.ALLOWED_ORIGINS → string[]
```

## Features

- **Type coercion** — `string`, `number`, `boolean`, `json`, `array`
- **Defaults** — Fallback values when env var is not set
- **Required/Optional** — Required by default, opt-out with `required: false`
- **Choices** — Restrict to allowed values
- **Custom transform** — Apply any transformation function
- **Collect all errors** — Reports every invalid var at once, not one at a time
- **Zero dependencies** — No bloat
- **Full TypeScript** — Inferred return types from schema

## API

### `validateEnv(schema, env?)`

| Param | Type | Description |
|-------|------|-------------|
| `schema` | `EnvSchema` | Validation rules per variable |
| `env` | `Record<string, string>` | Defaults to `process.env` |

### Rule options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `'string' \| 'number' \| 'boolean' \| 'json' \| 'array'` | `'string'` | Coercion type |
| `required` | `boolean` | `true` | Throw if missing |
| `default` | `any` | — | Fallback value |
| `choices` | `any[]` | — | Allowed values |
| `transform` | `(value: string) => any` | — | Custom transform (overrides type coercion) |

### Custom transform example

```ts
const config = validateEnv({
  API_URL: {
    transform: (v) => v.replace(/\/$/, ''), // strip trailing slash
  },
});
```

## Error handling

Throws `EnvValidationError` with all failures collected:

```
EnvValidationError: Environment validation failed:
  - DATABASE_URL is required but not set
  - PORT: Cannot convert "abc" to number
  - NODE_ENV must be one of [development, production, test], got "staging"
```

## License

MIT
