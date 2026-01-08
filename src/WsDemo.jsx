import React, {useEffect, useMemo, useRef, useState} from 'react'
import * as Sentry from '@sentry/react'
import {config} from './config.js'
import {getToken, clearToken} from './auth-storage.js'
import {runSentryNewTraceSync} from './helpers/run-sentry-new-trace.js'

const styles = {
  page: {fontFamily: 'sans-serif', padding: 12},
  row: {marginBottom: 10},
  btn: {margin: '6px 6px 6px 0', padding: '6px 11px'},
  pre: {
    background: '#111', color: '#0f0', padding: 10, borderRadius: 8,
    maxWidth: 700, height: 260, overflow: 'auto', whiteSpace: 'pre-wrap',
  },
}

function getSentryHeadersForWs() {
  const td = (Sentry.getTraceData && Sentry.getTraceData()) || {}
  return {
    sentryTrace: td['sentry-trace'] || '',
    baggage: td.baggage || '',
  }
}

export default function WsDemo({onLogout}) {
  const wsRef = useRef(null)
  const logRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [logs, setLogs] = useState([
    {text: 'Open this app in browser, click Connect.', type: 'info'},
  ])
  const WS_URL = useMemo(() => config.wsUrl, [])

  function log(...args) {
    const text = args.map(String).join(' ')
    let type = 'client'
    if (text.startsWith('[message]')) type = 'response'
    else if (text.startsWith('[error]')) type = 'error'
    else if (text.startsWith('[warn]')) type = 'warn'


    setLogs((prev) => [...prev, {text, type}])
  }

  function getColorOfText(type) {
    if (type === 'response') return '#00ff00'
    if (type === 'client') return '#4dbaea'
    if (type === 'warn') return '#eece00'
    if (type === 'error') return '#bb1313'
    return '#ccc'
  }

  useEffect(() => {
    // auto-scroll log
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    // cleanup on unmount
    return () => {
      try {
        if (wsRef.current) wsRef.current.close()
      } catch {
      }
      wsRef.current = null
    }
  }, [])

  function connect() {
    const ws = wsRef.current
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      log('[info] already connected/connecting')
      return
    }

    const token = getToken()

    Sentry.startSpan(
      {name: 'ws connect', op: 'ws.connect', forceTransaction: true},
      () => {
        const {sentryTrace, baggage} = getSentryHeadersForWs()

        const url =
          WS_URL + '/demo' +
          '?sentryTrace=' + encodeURIComponent(sentryTrace) +
          '&baggage=' + encodeURIComponent(baggage) +
          '&token=' + encodeURIComponent(token || '')

        log('[connect]', url)

        const next = new WebSocket(url)
        wsRef.current = next

        next.onopen = () => {
          log('[open]')
          setConnected(true)
        }

        next.onmessage = (e) => {
          log('[message]', e.data)
        }

        next.onclose = (e) => {
          log('[close]', 'code=', e.code, 'reason=', e.reason || '')
          setConnected(false)
          wsRef.current = null
        }

        next.onerror = () => {
          log('[error]')
          // marker so you see something in Sentry if WS fails
          Sentry.captureMessage('ws error')
        }
      },
    )
  }

  function disconnect() {
    if (wsRef.current) wsRef.current.close()
  }

  /**
   * Send a WS message with a fresh trace each time.
   * @param {string} type
   * @param {any} payload
   */
  function send(type, payload) {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      log('[warn] ws not open')
      return
    }

    runSentryNewTraceSync(`ws.send.${type}`, 'ws.send', (span) => {
      const ctx = span.spanContext()
      const sentryTrace = `${ctx.traceId}-${ctx.spanId}-1`
      const baggage = ''

      ws.send(JSON.stringify({type, payload, _trace: {sentryTrace, baggage}}))

      log('[sent]', type, sentryTrace ? `(trace=${sentryTrace})` : '')
    })
  }

  function logout() {
    try {
      if (wsRef.current) wsRef.current.close()
    } catch {
    }
    clearToken()
    onLogout()
  }

  return (
    <div style={styles.page}>
      <h2>Sentry uWebSockets tracing demo</h2>

      <div style={styles.row}>
        <button style={styles.btn} onClick={connect} disabled={connected}>
          Connect
        </button>
        <button style={styles.btn} onClick={disconnect} disabled={!connected}>
          Disconnect
        </button>
        <button style={styles.btn} onClick={() => send('ping', null)} disabled={!connected}>
          Send ping
        </button>
        <button style={styles.btn} onClick={() => send('work', {ms: 800})} disabled={!connected}>
          Send work (slow)
        </button>
        <button style={styles.btn} onClick={() => send('boom', null)} disabled={!connected}>
          Send boom (error)
        </button>

        <button style={{...styles.btn, color: '#888', marginLeft: '30px'}} onClick={logout}>
          Logout
        </button>
      </div>

      <pre id="log" ref={logRef} style={styles.pre}>
  {logs.map((l, i) => (
    <span
      key={i}
      style={{
        display: 'block',
        color: getColorOfText(l.type),
      }}
    >
      {l.text}
    </span>
  ))}
</pre>
    </div>
  )
}
