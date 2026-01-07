import React, { useState } from 'react'
import * as Sentry from '@sentry/react'
import { apiRequest } from './http.js'
import { setToken } from './auth-storage.js'
import { config } from './config.js'

const styles = {
  page: { fontFamily: 'sans-serif', padding: 12, maxWidth: 520 },
  tabs: { display: 'flex', gap: 8, marginBottom: 12 },
  tab: (active) => ({
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #ccc',
    cursor: 'pointer',
    background: active ? '#eee' : '#fff',
  }),
  row: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 },
  input: { padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc' },
  btn: { padding: '9px 12px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' },
  err: { color: '#b00020', marginTop: 8, whiteSpace: 'pre-wrap' },
}

function extractToken(data) {
  // common shapes:
  // {token: '...'} or {accessToken: '...'} or {data:{token:'...'}}
  if (!data) return ''
  if (typeof data === 'string') return ''
  if (data.token) return String(data.token)
  if (data.accessToken) return String(data.accessToken)
  if (data.data?.token) return String(data.data.token)
  if (data.data?.accessToken) return String(data.data.accessToken)
  return ''
}

export default function Auth({ onAuthed }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [err, setErr] = useState('')

  const [reg, setReg] = useState({ name: '', email: '', password: '', age: '' })
  const [log, setLog] = useState({ email: '', password: '' })

  async function doRegister() {
    setErr('')

    const payload = {
      name: reg.name,
      email: reg.email,
      password: reg.password,
    }
    if (reg.age !== '') payload.age = Number(reg.age)

    return Sentry.startNewTrace(async () => {
      try {
        const data = await Sentry.startSpan(
          { name: 'auth.register', op: 'ui.action', forceTransaction: true },
          async () => apiRequest(config.endpoints.register, { method: 'POST', json: payload }),
        )

        const token = extractToken(data)
        if (!token) throw new Error('No token in register response (check backend response shape)')

        setToken(token)
        onAuthed()
      } catch (e) {
        Sentry.captureException(e)
        setErr(String(e?.message || e))
      }
    })
  }

  async function doLogin() {
    setErr('')

    const payload = { email: log.email, password: log.password }

    return Sentry.startNewTrace(async () => {
      try {
        const data = await Sentry.startSpan(
          { name: 'auth.login', op: 'ui.action', forceTransaction: true },
          async () => apiRequest(config.endpoints.login, { method: 'POST', json: payload }),
        )

        const token = extractToken(data)
        if (!token) throw new Error('No token in login response (check backend response shape)')

        setToken(token)
        onAuthed()
      } catch (e) {
        Sentry.captureException(e)
        setErr(String(e?.message || e))
      }
    })
  }

  return (
    <div style={styles.page}>
      <h2>Auth demo</h2>

      <div style={styles.tabs}>
        <div style={styles.tab(tab === 'register')} onClick={() => setTab('register')}>
          Register
        </div>
        <div style={styles.tab(tab === 'login')} onClick={() => setTab('login')}>
          Login
        </div>
      </div>

      {tab === 'register' ? (
        <>
          <div style={styles.row}>
            <label>Name</label>
            <input
              style={styles.input}
              value={reg.name}
              onChange={(e) => setReg((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div style={styles.row}>
            <label>Email</label>
            <input
              style={styles.input}
              value={reg.email}
              onChange={(e) => setReg((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div style={styles.row}>
            <label>Password</label>
            <input
              style={styles.input}
              type="password"
              value={reg.password}
              onChange={(e) => setReg((p) => ({ ...p, password: e.target.value }))}
            />
          </div>

          <div style={styles.row}>
            <label>Age (optional)</label>
            <input
              style={styles.input}
              inputMode="numeric"
              value={reg.age}
              onChange={(e) => setReg((p) => ({ ...p, age: e.target.value }))}
            />
          </div>

          <button style={{ ...styles.btn, backgroundColor: '#28a745', color: '#fff' }} onClick={doRegister}>
            Register
          </button>
        </>
      ) : (
        <>
          <div style={styles.row}>
            <label>Email</label>
            <input
              style={styles.input}
              value={log.email}
              onChange={(e) => setLog((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div style={styles.row}>
            <label>Password</label>
            <input
              style={styles.input}
              type="password"
              value={log.password}
              onChange={(e) => setLog((p) => ({ ...p, password: e.target.value }))}
            />
          </div>

          <button style={{ ...styles.btn, backgroundColor: '#28a745', color: '#fff' }} onClick={doLogin}>
            Login
          </button>
        </>
      )}

      {err ? <div style={styles.err}>{err}</div> : null}
    </div>
  )
}
