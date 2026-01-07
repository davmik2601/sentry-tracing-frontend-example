import * as Sentry from '@sentry/react'
import { config } from './config.js'

/**
 * Small helper: attaches Sentry trace headers to your API calls.
 * Also wraps request in a Sentry span so you see FE timing in the trace.
 *
 * @param {string} path
 * @param {{ method?: string, json?: any, token?: string }} opts
 */
export async function apiRequest(path, opts = {}) {
  const method = opts.method || 'GET'
  const url = config.apiUrl + path

  return Sentry.startSpan(
    { name: `http ${method} ${path}`, op: 'http.client', forceTransaction: true },
    async () => {
      const td = (Sentry.getTraceData && Sentry.getTraceData()) || {}
      const sentryTrace = td['sentry-trace'] || ''
      const baggage = td.baggage || ''

      /** @type {Record<string, string>} */
      const headers = {
        'content-type': 'application/json',
      }

      // trace propagation to BE
      if (sentryTrace) headers['sentry-trace'] = sentryTrace
      if (baggage) headers['baggage'] = baggage

      // auth
      if (opts.token) headers.authorization = `Bearer ${opts.token}`

      const res = await fetch(url, {
        method,
        headers,
        body: opts.json ? JSON.stringify(opts.json) : undefined,
      })

      const text = await res.text()
      let data = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}`)
        // attach response info for debugging
        Sentry.setContext('http_error', { url, method, status: res.status, body: data })
        throw err
      }

      return data
    },
  )
}
