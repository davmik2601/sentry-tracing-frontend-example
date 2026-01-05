/**
 * @typedef {Object} ImportMetaEnv
 * @property {string} VITE_WS_URL
 * @property {string} VITE_API_URL
 * @property {string} VITE_SENTRY_DSN
 */

/**
 * Frontend env config
 */
export const config = {
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
}
