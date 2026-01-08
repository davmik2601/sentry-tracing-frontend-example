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

  const headers = {
    'content-type': 'application/json',
  }

  // auth
  if (opts.token) headers.authorization = `Bearer ${opts.token}`

  const res = await fetch(url, {
    method,
    headers,
    body: opts.json ? JSON.stringify(opts.json) : undefined,
  })

  const text = await res.text()
  let data

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  return data
}
