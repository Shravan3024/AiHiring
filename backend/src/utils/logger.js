/**
 * Simple Logger Utility
 * Provides structured logging for AI operations and debugging
 */

const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = '✓ [INFO]';
    console.log(`${prefix} ${timestamp} - ${message}`, data ? data : '');
  },

  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = '⚠ [WARN]';
    console.warn(`${prefix} ${timestamp} - ${message}`, data ? data : '');
  },

  error: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = '✗ [ERROR]';
    console.error(`${prefix} ${timestamp} - ${message}`, data ? data : '');
  },

  debug: (message, data = null) => {
    if (!isDev) return; // Only log debug in development
    const timestamp = new Date().toISOString();
    const prefix = '◆ [DEBUG]';
    console.log(`${prefix} ${timestamp} - ${message}`, data ? data : '');
  },

  success: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = '★ [SUCCESS]';
    console.log(`${prefix} ${timestamp} - ${message}`, data ? data : '');
  }
};

module.exports = logger;
