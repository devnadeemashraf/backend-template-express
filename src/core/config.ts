import { getENV } from "@/utils/env";

// General Settings
export const NODE_ENV = getENV<string>("NODE_ENV", "development");
export const PORT = getENV<number>("PORT", 9001);
export const APP_NAME = getENV<string>("APP_NAME", "Backend Template Express");
export const TZ = getENV<string>("TZ", "UTC");

// Security
export const JWT_ACCESS_SECRET = getENV<string>(
  "JWT_ACCESS_SECRET",
  "762nmhbUfhcVi0TMyPXwM1sXS1QjyfIRtIgrBmNEii0=",
);
// 15 * 60 * 1000  = 900,000 milliseconds
export const JWT_ACCESS_EXPIRATION = getENV<number>("JWT_ACCESS_EXPIRATION", 900_000);
export const JWT_REFRESH_SECRET = getENV<string>(
  "JWT_REFRESH_SECRET",
  "762nmhbUfhcVi0TMyPXwM1sXS1QjyfIRtIgrBmNEii0=",
);
// 7 * 24 * 60 * 60 * 1000  = 604,800,000 milliseconds
export const JWT_REFRESH_EXPIRATION = getENV<number>("JWT_REFRESH_EXPIRATION", 604_800_000);

// BloomFilter & Encryption
/** Secret key used for encryption and decryption operations */
export const ENCRYPTION_KEY = getENV<string>(
  "ENCRYPTION_KEY",
  "762nmhbUfhcVi0TMyPXwM1sXS1QjyfIRtIgrBmNEii0=",
);
/** File path for storing the encrypted BloomFilter state */
export const BLOOM_FILTER_PATH = getENV<string>(
  "BLOOM_FILTER_PATH",
  "./data/local/enc/bloomfilters.enc",
);
/** Expected number of elements to be stored in the BloomFilter */
export const BLOOM_FILTER_EXPECTED_ELEMENTS = getENV<number>(
  "BLOOM_FILTER_EXPECTED_ELEMENTS",
  10000,
);
/** Target false positive rate for the BloomFilter (e.g., 0.01 = 1%) */
export const BLOOM_FILTER_FALSE_POSITIVE_RATE = getENV<number>(
  "BLOOM_FILTER_FALSE_POSITIVE_RATE",
  0.01,
);

// CORS
export const CORS_ORIGINS = getENV<string>(
  "CORS_ORIGINS",
  "http://localhost:3000,http://localhost:8080",
);

// Rate Limiting
export const RATE_LIMIT_MAX = getENV<number>("RATE_LIMIT_MAX", 50);
export const RATE_LIMIT_WINDOW = getENV<string>("RATE_LIMIT_WINDOW", "1m");

// Session
export const SESSION_LIMIT_DEFAULT = getENV<number>("SESSION_LIMIT_DEFAULT", 100);
export const SESSION_LIMIT_MAX = getENV<number>("SESSION_LIMIT_MAX", 100);
export const SESSION_TIMEOUT = getENV<number>("SESSION_TIMEOUT", 3600);

// PostgreSQL (App DB)
export const PG_APP_HOST = getENV<string>("PG_APP_HOST", "localhost");
export const PG_APP_PORT = getENV<number>("PG_APP_PORT", 5432);
export const PG_APP_USER = getENV<string>("PG_APP_USER", "app_user");
export const PG_APP_PASSWORD = getENV<string>("PG_APP_PASSWORD", "app_password");
export const PG_APP_DATABASE = getENV<string>("PG_APP_DATABASE", "app_db");
export const PG_APP_SSL = getENV<string>("PG_APP_SSL", "false");
export const PG_APP_URL = getENV<string>(
  "PG_APP_URL",
  `postgresql://${PG_APP_USER}:${PG_APP_PASSWORD}@${PG_APP_HOST}:${PG_APP_PORT}/${PG_APP_DATABASE}`,
);
export const PG_APP_POOL_MIN = getENV<number>("PG_APP_POOL_MIN", 2);
export const PG_APP_POOL_MAX = getENV<number>("PG_APP_POOL_MAX", 10);
export const PG_APP_POOL_IDLE = getENV<number>("PG_APP_POOL_IDLE", 30000);

// PostgreSQL (Logs DB)
export const PG_LOGS_HOST = getENV<string>("PG_LOGS_HOST", "localhost");
export const PG_LOGS_PORT = getENV<number>("PG_LOGS_PORT", 5433);
export const PG_LOGS_USER = getENV<string>("PG_LOGS_USER", "logs_user");
export const PG_LOGS_PASSWORD = getENV<string>("PG_LOGS_PASSWORD", "logs_password");
export const PG_LOGS_DATABASE = getENV<string>("PG_LOGS_DATABASE", "logs_db");
export const PG_LOGS_SSL = getENV<string>("PG_LOGS_SSL", "false");
export const PG_LOGS_SCHEMA = getENV<string>("PG_LOGS_SCHEMA", "logs");
export const PG_LOGS_URL = getENV<string>(
  "PG_LOGS_URL",
  `postgresql://${PG_LOGS_USER}:${PG_LOGS_PASSWORD}@${PG_LOGS_HOST}:${PG_LOGS_PORT}/${PG_LOGS_DATABASE}?schema=${PG_LOGS_SCHEMA}`,
);
export const PG_LOGS_POOL_MIN = getENV<number>("PG_LOGS_POOL_MIN", 2);
export const PG_LOGS_POOL_MAX = getENV<number>("PG_LOGS_POOL_MAX", 10);
export const PG_LOGS_POOL_IDLE = getENV<number>("PG_LOGS_POOL_IDLE", 30000);

// Redis (Cache)
export const REDIS_HOST = getENV<string>("REDIS_HOST", "localhost");
export const REDIS_PORT = getENV<number>("REDIS_PORT", 6379);
export const REDIS_PASSWORD = getENV<string>("REDIS_PASSWORD", "redis_password");
export const REDIS_DB = getENV<number>("REDIS_DB", 0);
export const REDIS_TTL = getENV<number>("REDIS_TTL", 3600);

export const REDIS_URL = `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;

// Monitoring & Logging
export const LOG_LEVEL = getENV<string>("LOG_LEVEL", "debug");
export const DEBUG = getENV<string>("DEBUG", "true");

// External Services
export const SMTP_HOST = getENV<string>("SMTP_HOST", "smtp.example.com");
export const SMTP_PORT = getENV<number>("SMTP_PORT", 587);
export const SMTP_USER = getENV<string>("SMTP_USER", "smtp_user");
export const SMTP_PASSWORD = getENV<string>("SMTP_PASSWORD", "smtp_password");
export const SMTP_FROM = getENV<string>("SMTP_FROM", "no-reply@example.com");
export const SENDGRID_API_KEY = getENV<string>("SENDGRID_API_KEY", "your-sendgrid-api-key");

// Docker Compose
export const COMPOSE_PROJECT_NAME = getENV<string>(
  "COMPOSE_PROJECT_NAME",
  "backend-template-express",
);
