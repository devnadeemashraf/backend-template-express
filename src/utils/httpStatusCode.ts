/**
 * HTTP Status Codes as defined by RFC 7231 and common extensions
 * @see https://tools.ietf.org/html/rfc7231#section-6
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */

// 1xx - Informational responses
export const INFORMATIONAL = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102, // WebDAV
  EARLY_HINTS: 103, // RFC 8297
};

// 2xx - Successful responses
export const SUCCESS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207, // WebDAV
  ALREADY_REPORTED: 208, // WebDAV
  IM_USED: 226, // HTTP Delta encoding
};

// 3xx - Redirection messages
export const REDIRECTION = {
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305, // Deprecated
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
};

// 4xx - Client error responses
export const CLIENT_ERROR = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421, // HTTP/2
  UNPROCESSABLE_ENTITY: 422, // WebDAV
  LOCKED: 423, // WebDAV
  FAILED_DEPENDENCY: 424, // WebDAV
  TOO_EARLY: 425, // RFC 8470
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428, // RFC 6585
  TOO_MANY_REQUESTS: 429, // RFC 6585
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431, // RFC 6585
  UNAVAILABLE_FOR_LEGAL_REASONS: 451, // RFC 7725
};

// 5xx - Server error responses
export const SERVER_ERROR = {
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506, // RFC 2295
  INSUFFICIENT_STORAGE: 507, // WebDAV
  LOOP_DETECTED: 508, // WebDAV
  NOT_EXTENDED: 510, // RFC 2774
  NETWORK_AUTHENTICATION_REQUIRED: 511, // RFC 6585
};

/**
 * Consolidated HTTP status codes
 * Combines all categories into a single object
 */
export const HTTP_STATUS_CODES = {
  ...INFORMATIONAL,
  ...SUCCESS,
  ...REDIRECTION,
  ...CLIENT_ERROR,
  ...SERVER_ERROR,
};

/**
 * HTTP status messages corresponding to status codes
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  // 1xx - Informational
  [INFORMATIONAL.CONTINUE]: "Continue",
  [INFORMATIONAL.SWITCHING_PROTOCOLS]: "Switching Protocols",
  [INFORMATIONAL.PROCESSING]: "Processing",
  [INFORMATIONAL.EARLY_HINTS]: "Early Hints",

  // 2xx - Success
  [SUCCESS.OK]: "OK",
  [SUCCESS.CREATED]: "Created",
  [SUCCESS.ACCEPTED]: "Accepted",
  [SUCCESS.NON_AUTHORITATIVE_INFORMATION]: "Non-Authoritative Information",
  [SUCCESS.NO_CONTENT]: "No Content",
  [SUCCESS.RESET_CONTENT]: "Reset Content",
  [SUCCESS.PARTIAL_CONTENT]: "Partial Content",
  [SUCCESS.MULTI_STATUS]: "Multi-Status",
  [SUCCESS.ALREADY_REPORTED]: "Already Reported",
  [SUCCESS.IM_USED]: "IM Used",

  // 3xx - Redirection
  [REDIRECTION.MULTIPLE_CHOICES]: "Multiple Choices",
  [REDIRECTION.MOVED_PERMANENTLY]: "Moved Permanently",
  [REDIRECTION.FOUND]: "Found",
  [REDIRECTION.SEE_OTHER]: "See Other",
  [REDIRECTION.NOT_MODIFIED]: "Not Modified",
  [REDIRECTION.USE_PROXY]: "Use Proxy",
  [REDIRECTION.TEMPORARY_REDIRECT]: "Temporary Redirect",
  [REDIRECTION.PERMANENT_REDIRECT]: "Permanent Redirect",

  // 4xx - Client Errors
  [CLIENT_ERROR.BAD_REQUEST]: "Bad Request",
  [CLIENT_ERROR.UNAUTHORIZED]: "Unauthorized",
  [CLIENT_ERROR.PAYMENT_REQUIRED]: "Payment Required",
  [CLIENT_ERROR.FORBIDDEN]: "Forbidden",
  [CLIENT_ERROR.NOT_FOUND]: "Not Found",
  [CLIENT_ERROR.METHOD_NOT_ALLOWED]: "Method Not Allowed",
  [CLIENT_ERROR.NOT_ACCEPTABLE]: "Not Acceptable",
  [CLIENT_ERROR.PROXY_AUTHENTICATION_REQUIRED]: "Proxy Authentication Required",
  [CLIENT_ERROR.REQUEST_TIMEOUT]: "Request Timeout",
  [CLIENT_ERROR.CONFLICT]: "Conflict",
  [CLIENT_ERROR.GONE]: "Gone",
  [CLIENT_ERROR.LENGTH_REQUIRED]: "Length Required",
  [CLIENT_ERROR.PRECONDITION_FAILED]: "Precondition Failed",
  [CLIENT_ERROR.PAYLOAD_TOO_LARGE]: "Payload Too Large",
  [CLIENT_ERROR.URI_TOO_LONG]: "URI Too Long",
  [CLIENT_ERROR.UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
  [CLIENT_ERROR.RANGE_NOT_SATISFIABLE]: "Range Not Satisfiable",
  [CLIENT_ERROR.EXPECTATION_FAILED]: "Expectation Failed",
  [CLIENT_ERROR.MISDIRECTED_REQUEST]: "Misdirected Request",
  [CLIENT_ERROR.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
  [CLIENT_ERROR.LOCKED]: "Locked",
  [CLIENT_ERROR.FAILED_DEPENDENCY]: "Failed Dependency",
  [CLIENT_ERROR.TOO_EARLY]: "Too Early",
  [CLIENT_ERROR.UPGRADE_REQUIRED]: "Upgrade Required",
  [CLIENT_ERROR.PRECONDITION_REQUIRED]: "Precondition Required",
  [CLIENT_ERROR.TOO_MANY_REQUESTS]: "Too Many Requests",
  [CLIENT_ERROR.REQUEST_HEADER_FIELDS_TOO_LARGE]: "Request Header Fields Too Large",
  [CLIENT_ERROR.UNAVAILABLE_FOR_LEGAL_REASONS]: "Unavailable For Legal Reasons",

  // 5xx - Server Errors
  [SERVER_ERROR.INTERNAL_SERVER_ERROR]: "Internal Server Error",
  [SERVER_ERROR.NOT_IMPLEMENTED]: "Not Implemented",
  [SERVER_ERROR.BAD_GATEWAY]: "Bad Gateway",
  [SERVER_ERROR.SERVICE_UNAVAILABLE]: "Service Unavailable",
  [SERVER_ERROR.GATEWAY_TIMEOUT]: "Gateway Timeout",
  [SERVER_ERROR.HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version Not Supported",
  [SERVER_ERROR.VARIANT_ALSO_NEGOTIATES]: "Variant Also Negotiates",
  [SERVER_ERROR.INSUFFICIENT_STORAGE]: "Insufficient Storage",
  [SERVER_ERROR.LOOP_DETECTED]: "Loop Detected",
  [SERVER_ERROR.NOT_EXTENDED]: "Not Extended",
  [SERVER_ERROR.NETWORK_AUTHENTICATION_REQUIRED]: "Network Authentication Required",
};

/**
 * Types for status code categories
 */
export type TInformationalResponse = keyof typeof INFORMATIONAL;
export type TSuccessResponse = keyof typeof SUCCESS;
export type TRedirectionResponse = keyof typeof REDIRECTION;
export type TClientErrorResponse = keyof typeof CLIENT_ERROR;
export type TServerErrorResponse = keyof typeof SERVER_ERROR;

/**
 * Combined type for all HTTP status codes
 */
export type THttpResponse =
  | TInformationalResponse
  | TSuccessResponse
  | TRedirectionResponse
  | TClientErrorResponse
  | TServerErrorResponse;

/**
 * Helper function to get status code from status name
 * @param statusName The HTTP status name (e.g., 'NOT_FOUND')
 * @returns The corresponding HTTP status code (e.g., 404)
 */
export function getStatusCode(statusName: THttpResponse): number {
  return HTTP_STATUS_CODES[statusName];
}

/**
 * Helper function to get status message from status code
 * @param statusCode The HTTP status code (e.g., 404)
 * @returns The corresponding HTTP status message (e.g., 'Not Found')
 */
export function getStatusMessage(statusCode: number): string {
  return HTTP_STATUS_MESSAGES[statusCode] || "Unknown Status";
}

/**
 * Check if status code is an informational response (1xx)
 */
export function isInformational(statusCode: number): boolean {
  return statusCode >= 100 && statusCode < 200;
}

/**
 * Check if status code is a success response (2xx)
 */
export function isSuccess(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Check if status code is a redirection response (3xx)
 */
export function isRedirection(statusCode: number): boolean {
  return statusCode >= 300 && statusCode < 400;
}

/**
 * Check if status code is a client error response (4xx)
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Check if status code is a server error response (5xx)
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Check if status code is an error response (4xx or 5xx)
 */
export function isError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 600;
}
