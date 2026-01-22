/**
 * Security utilities for sanitization and safe output
 */

/**
 * HTML-escape a string to prevent XSS attacks
 * Use this when inserting user data into HTML templates
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Redact an email address for logging purposes
 * Example: "user@example.com" -> "us***@example.com"
 */
export function redactEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return '***@***';

  const visibleChars = Math.min(2, localPart.length);
  const redactedLocal = localPart.slice(0, visibleChars) + '***';

  return `${redactedLocal}@${domain}`;
}

/**
 * Sanitize error messages for external responses
 * Removes potentially sensitive information
 */
export function sanitizeErrorMessage(error: unknown): string {
  // Always return a generic message for external responses
  // Log the actual error server-side
  if (error instanceof Error) {
    // Check for known safe error types
    if (error.message.includes('not found')) {
      return 'Resource not found';
    }
    if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
      return 'Unauthorized';
    }
    if (error.message.includes('invalid')) {
      return 'Invalid request';
    }
  }

  // Default generic message
  return 'An error occurred';
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Safe logger that redacts PII in production
 */
export const safeLog = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(message, data ? sanitizeLogData(data) : '');
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(message, error, data ? sanitizeLogData(data) : '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(message, data ? sanitizeLogData(data) : '');
  },
};

function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  if (!isProduction()) return data;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().includes('email') && typeof value === 'string') {
      sanitized[key] = redactEmail(value);
    } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
