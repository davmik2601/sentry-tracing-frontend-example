import * as Sentry from '@sentry/react'

/**
 * Initialize Sentry once for the whole app.
 * Call this before React renders.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    // keep app working even if env is missing
    // (but you won't see Sentry events)
    console.warn('[sentry] VITE_SENTRY_DSN is not set')
    return
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration({
        instrumentPageLoad: false,
        instrumentNavigation: false,
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
