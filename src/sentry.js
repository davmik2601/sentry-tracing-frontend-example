import * as Sentry from '@sentry/react'
import {config} from './config.js'

/**
 * Initialize Sentry once for the whole app.
 * Call this before React renders.
 */
export function initSentry() {
  const dsn = config.sentryDsn

  if (!dsn) {
    // keep app working even if env is missing
    console.warn('[sentry] VITE_SENTRY_DSN is not set')
    return
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      // Important !, must set the correct API origin here
      new URL(config.apiUrl).origin,
    ],
    integrations: [
      Sentry.browserTracingIntegration({
        instrumentPageLoad: false,
        instrumentNavigation: false,
        // idleTimeout: 200,        // default 1000
        // childSpanTimeout: 1000,  // default 15000
        // finalTimeout: 5000,      // default 30000
      }),
    ],
  })
}

/**
 * Returns Sentry's official trace propagation headers (same shape as HTTP)
 * { 'sentry-trace': '...', baggage: '...' }
 */
export function getTraceData() {
  const td = (Sentry.getTraceData && Sentry.getTraceData()) || {}
  return {
    sentryTrace: td['sentry-trace'] || '',
    baggage: td.baggage || '',
  }
}

/**
 * Convert a span into a "sentry-trace" header string: traceId-spanId-1
 * @param {any} span
 */
export function spanToSentryTrace(span) {
  const ctx = span?.spanContext?.()
  if (!ctx?.traceId || !ctx?.spanId) return ''
  return `${ctx.traceId}-${ctx.spanId}-1`
}
