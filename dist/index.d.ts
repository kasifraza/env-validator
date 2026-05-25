export type EnvType = 'string' | 'number' | 'boolean' | 'json' | 'array';
export interface EnvRule {
    type?: EnvType;
    required?: boolean;
    default?: unknown;
    choices?: readonly unknown[];
    transform?: (value: string) => unknown;
}
export type EnvSchema = Record<string, EnvRule>;
type InferType<T extends EnvRule> = T['type'] extends 'number' ? number : T['type'] extends 'boolean' ? boolean : T['type'] extends 'json' ? unknown : T['type'] extends 'array' ? string[] : string;
export type ValidatedEnv<S extends EnvSchema> = {
    [K in keyof S]: InferType<S[K]>;
};
export declare class EnvValidationError extends Error {
    errors: string[];
    constructor(errors: string[]);
}
export declare function validateEnv<S extends EnvSchema>(schema: S, env?: Record<string, string | undefined>): ValidatedEnv<S>;
export {};
