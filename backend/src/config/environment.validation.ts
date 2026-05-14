export type NodeEnvironment = 'development' | 'test' | 'production';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_ORIGIN: string;
  SESSION_COOKIE_NAME: string;
  SESSION_IDLE_TIMEOUT_MINUTES: number;
  SESSION_ABSOLUTE_TIMEOUT_DAYS: number;
}

const allowedNodeEnvironments: NodeEnvironment[] = ['development', 'test', 'production'];

function requireString(config: Record<string, unknown>, key: keyof EnvironmentVariables, errors: string[]): string {
  const value = config[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${key} is required and must be a non-empty string`);
    return '';
  }

  return value.trim();
}

function optionalString(config: Record<string, unknown>, key: keyof EnvironmentVariables, fallback: string): string {
  const value = config[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function optionalPositiveInteger(
  config: Record<string, unknown>,
  key: keyof EnvironmentVariables,
  fallback: number,
  errors: string[],
): number {
  const rawValue = config[key];
  const value = rawValue === undefined || rawValue === null || rawValue === '' ? fallback : Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    errors.push(`${key} must be a positive integer`);
    return fallback;
  }

  return value;
}

function requirePort(config: Record<string, unknown>, errors: string[]): number {
  const rawValue = config.PORT;
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);

  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    errors.push('PORT is required and must be an integer between 1 and 65535');
    return 0;
  }

  return value;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const errors: string[] = [];

  const nodeEnv = requireString(config, 'NODE_ENV', errors) as NodeEnvironment;
  const databaseUrl = requireString(config, 'DATABASE_URL', errors);
  const frontendOrigin = requireString(config, 'FRONTEND_ORIGIN', errors);
  const port = requirePort(config, errors);
  const sessionCookieName = optionalString(config, 'SESSION_COOKIE_NAME', 'scale_admin_session');
  const sessionIdleTimeoutMinutes = optionalPositiveInteger(config, 'SESSION_IDLE_TIMEOUT_MINUTES', 30, errors);
  const sessionAbsoluteTimeoutDays = optionalPositiveInteger(config, 'SESSION_ABSOLUTE_TIMEOUT_DAYS', 14, errors);

  if (nodeEnv && !allowedNodeEnvironments.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${allowedNodeEnvironments.join(', ')}`);
  }

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
        errors.push('DATABASE_URL must use the postgres:// or postgresql:// protocol');
      }
    } catch {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection URL');
    }
  }

  if (frontendOrigin) {
    try {
      const url = new URL(frontendOrigin);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('FRONTEND_ORIGIN must use the http:// or https:// protocol');
      }
    } catch {
      errors.push('FRONTEND_ORIGIN must be a valid URL origin');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl,
    FRONTEND_ORIGIN: frontendOrigin,
    SESSION_COOKIE_NAME: sessionCookieName,
    SESSION_IDLE_TIMEOUT_MINUTES: sessionIdleTimeoutMinutes,
    SESSION_ABSOLUTE_TIMEOUT_DAYS: sessionAbsoluteTimeoutDays,
  };
}
