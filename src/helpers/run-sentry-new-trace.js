import * as Sentry from '@sentry/react'

/**
 * Run a function inside a new Sentry trace and span.
 * @param {string} name - Name of the span
 * @param {string | null | undefined} op - Operation type of the span
 * @param {(span: any) => any | Promise<any>} fn - Function to execute (receives span)
 * @return {Promise<*>} - Result of the function execution
 */
export async function runSentryNewTrace(name, op, fn) {
  return Sentry.startNewTrace(() =>
    Sentry.startSpan(
      {
        name,
        op: `frontend.${op || 'unknown_operation'}`,
        forceTransaction: true,
      },
      fn,
    ),
  )
}

/**
 * Run a function inside a new Sentry trace and span (synchronous version).
 * @param {string} name - Name of the span
 * @param {string | null | undefined} op - Operation type of the span
 * @param {(span: any) => any} fn - Function to execute (receives span)
 * @return {*} - Result of the function execution
 */
export function runSentryNewTraceSync(name, op, fn) {
  return Sentry.startNewTrace(() =>
    Sentry.startSpan(
      {
        name,
        op: `frontend.${op || 'unknown_operation'}`,
        forceTransaction: true,
      },
      fn,
    ),
  )
}
