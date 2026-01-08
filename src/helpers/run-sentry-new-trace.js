import * as Sentry from '@sentry/react'

/**
 * Run a function inside a new Sentry trace and span.
 * @param {string} name - Name of the span
 * @param {string | null | undefined} op - Operation type of the span
 * @param {Function} fn - Function to execute
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
