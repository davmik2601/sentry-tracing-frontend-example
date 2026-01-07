import React, { useEffect, useState } from 'react'
import Auth from './Auth.jsx'
import WsDemo from './WsDemo.jsx'
import { getToken } from './auth-storage.js'

export default function App() {
  const [authed, setAuthed] = useState(Boolean(getToken()))

  useEffect(() => {
    setAuthed(Boolean(getToken()))
  }, [])

  if (!authed) {
    return <Auth onAuthed={() => setAuthed(true)} />
  }

  return <WsDemo onLogout={() => setAuthed(false)} />
}
