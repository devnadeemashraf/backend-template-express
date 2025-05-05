import { getENV } from "@/utils";

// General Settings
const NODE_ENV = getENV<string>("NODE_ENV", "development");
const PORT = getENV<number>("PORT", 9001);
const APP_NAME = getENV<string>("APP_NAME", "Backend Template Express");
const TZ = getENV<string>("TZ", "UTC");

// Security
const JWT_ACCESS_SECRET = getENV<string>(
  "JWT_ACCESS_SECRET",
  "762nmhbUfhcVi0TMyPXwM1sXS1QjyfIRtIgrBmNEii0=",
);
// 15 * 60 * 1000  = 900,000 milliseconds
const JWT_ACCESS_EXPIRATION = getENV<number>("JWT_ACCESS_EXPIRATION", 900_000);
const JWT_REFRESH_SECRET = getENV<string>(
  "JWT_REFRESH_SECRET",
  "762nmhbUfhcVi0TMyPXwM1sXS1QjyfIRtIgrBmNEii0=",
);
// 7 * 24 * 60 * 60 * 1000  = 604,800,000 milliseconds
const JWT_REFRESH_EXPIRATION = getENV<number>("JWT_REFRESH_EXPIRATION", 604_800_000);

// CORS
const CORS_ORIGINS = getENV<string>("CORS_ORIGINS", "http://localhost:3000,http://localhost:8080");

// Rate Limiting
const RATE_LIMIT_MAX = getENV<number>("RATE_LIMIT_MAX", 50);
const RATE_LIMIT_WINDOW = getENV<string>("RATE_LIMIT_WINDOW", "1m");

// Session
const SESSION_LIMIT_DEFAULT = getENV<number>("SESSION_LIMIT_DEFAULT", 100);
const SESSION_LIMIT_MAX = getENV<number>("SESSION_LIMIT_MAX", 100);
const SESSION_TIMEOUT = getENV<number>("SESSION_TIMEOUT", 3600);

// PostgreSQL (App DB)
const PG_APP_HOST = getENV<string>("PG_APP_HOST", "localhost");
const PG_APP_PORT = getENV<number>("PG_APP_PORT", 5432);
const PG_APP_USER = getENV<string>("PG_APP_USER", "app_user");
const PG_APP_PASSWORD = getENV<string>("PG_APP_PASSWORD", "app_password");
const PG_APP_DATABASE = getENV<string>("PG_APP_DATABASE", "app_db");
const PG_APP_SSL = getENV<string>("PG_APP_SSL", "false");
const PG_APP_URL = getENV<string>(
  "PG_APP_URL",
  `postgresql://${PG_APP_USER}:${PG_APP_PASSWORD}@${PG_APP_HOST}:${PG_APP_PORT}/${PG_APP_DATABASE}`,
);
const PG_APP_POOL_MIN = getENV<number>("PG_APP_POOL_MIN", 2);
const PG_APP_POOL_MAX = getENV<number>("PG_APP_POOL_MAX", 10);
const PG_APP_POOL_IDLE = getENV<number>("PG_APP_POOL_IDLE", 30000);

// PostgreSQL (Logs DB)
const PG_LOGS_HOST = getENV<string>("PG_LOGS_HOST", "localhost");
const PG_LOGS_PORT = getENV<number>("PG_LOGS_PORT", 5433);
const PG_LOGS_USER = getENV<string>("PG_LOGS_USER", "logs_user");
const PG_LOGS_PASSWORD = getENV<string>("PG_LOGS_PASSWORD", "logs_password");
const PG_LOGS_DATABASE = getENV<string>("PG_LOGS_DATABASE", "logs_db");
const PG_LOGS_SSL = getENV<string>("PG_LOGS_SSL", "false");
const PG_LOGS_SCHEMA = getENV<string>("PG_LOGS_SCHEMA", "logs");
const PG_LOGS_URL = getENV<string>(
  "PG_LOGS_URL",
  `postgresql://${PG_LOGS_USER}:${PG_LOGS_PASSWORD}@${PG_LOGS_HOST}:${PG_LOGS_PORT}/${PG_LOGS_DATABASE}?schema=${PG_LOGS_SCHEMA}`,
);
const PG_LOGS_POOL_MIN = getENV<number>("PG_LOGS_POOL_MIN", 2);
const PG_LOGS_POOL_MAX = getENV<number>("PG_LOGS_POOL_MAX", 10);
const PG_LOGS_POOL_IDLE = getENV<number>("PG_LOGS_POOL_IDLE", 30000);

// Redis (Cache)
const REDIS_HOST = getENV<string>("REDIS_HOST", "localhost");
const REDIS_PORT = getENV<number>("REDIS_PORT", 6379);
const REDIS_PASSWORD = getENV<string>("REDIS_PASSWORD", "redis_password");
const REDIS_DB = getENV<number>("REDIS_DB", 0);
const REDIS_TTL = getENV<number>("REDIS_TTL", 3600);

// Monitoring & Logging
const LOG_LEVEL = getENV<string>("LOG_LEVEL", "debug");
const DEBUG = getENV<string>("DEBUG", "true");

// External Services
const SMTP_HOST = getENV<string>("SMTP_HOST", "smtp.example.com");
const SMTP_PORT = getENV<number>("SMTP_PORT", 587);
const SMTP_USER = getENV<string>("SMTP_USER", "smtp_user");
const SMTP_PASSWORD = getENV<string>("SMTP_PASSWORD", "smtp_password");
const SMTP_FROM = getENV<string>("SMTP_FROM", "no-reply@example.com");
const SENDGRID_API_KEY = getENV<string>("SENDGRID_API_KEY", "your-sendgrid-api-key");

// Docker Compose
const COMPOSE_PROJECT_NAME = getENV<string>("COMPOSE_PROJECT_NAME", "backend-template-express");

export {
  // General Settings
  NODE_ENV,
  PORT,
  APP_NAME,
  TZ,

  // Security
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION,
  CORS_ORIGINS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
  SESSION_LIMIT_DEFAULT,
  SESSION_LIMIT_MAX,
  SESSION_TIMEOUT,

  // PostgreSQL (App DB)
  PG_APP_HOST,
  PG_APP_PORT,
  PG_APP_USER,
  PG_APP_PASSWORD,
  PG_APP_DATABASE,
  PG_APP_SSL,
  PG_APP_URL,
  PG_APP_POOL_MIN,
  PG_APP_POOL_MAX,
  PG_APP_POOL_IDLE,

  // PostgreSQL (Logs DB)
  PG_LOGS_HOST,
  PG_LOGS_PORT,
  PG_LOGS_USER,
  PG_LOGS_PASSWORD,
  PG_LOGS_DATABASE,
  PG_LOGS_SSL,
  PG_LOGS_SCHEMA,
  PG_LOGS_URL,
  PG_LOGS_POOL_MIN,
  PG_LOGS_POOL_MAX,
  PG_LOGS_POOL_IDLE,

  // Redis (Cache)
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
  REDIS_TTL,

  // Monitoring & Logging
  LOG_LEVEL,
  DEBUG,

  // External Services
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  SENDGRID_API_KEY,

  // Docker Compose
  COMPOSE_PROJECT_NAME,
};
