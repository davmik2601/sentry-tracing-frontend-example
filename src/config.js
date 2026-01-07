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
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:4040/ws',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3030',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',

  endpoints: {
    register: '/auth/register',
    login: '/auth/login',
  },

  storageKey: 'access_token',
}
