"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvValidationError = void 0;
exports.validateEnv = validateEnv;
class EnvValidationError extends Error {
    constructor(errors) {
        super(`Environment validation failed:\n  - ${errors.join('\n  - ')}`);
        this.errors = errors;
        this.name = 'EnvValidationError';
    }
}
exports.EnvValidationError = EnvValidationError;
function coerce(value, type) {
    switch (type) {
        case 'number': {
            const n = Number(value);
            if (isNaN(n))
                throw new Error(`Cannot convert "${value}" to number`);
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
function validateEnv(schema, env = process.env) {
    const result = {};
    const errors = [];
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
            let value;
            if (rule.transform) {
                value = rule.transform(raw);
            }
            else {
                value = coerce(raw, rule.type || 'string');
            }
            if (rule.choices && !rule.choices.includes(value)) {
                errors.push(`${key} must be one of [${rule.choices.join(', ')}], got "${value}"`);
                continue;
            }
            result[key] = value;
        }
        catch (e) {
            errors.push(`${key}: ${e.message}`);
        }
    }
    if (errors.length > 0) {
        throw new EnvValidationError(errors);
    }
    return result;
}
