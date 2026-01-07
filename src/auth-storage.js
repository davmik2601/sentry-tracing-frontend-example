import { config } from './config.js'

/**
 * Get auth token from local storage
 * @return {string}
 */
export function getToken() {
  try {
    return localStorage.getItem(config.storageKey) || ''
  } catch {
    return ''
  }
}

/**
 * Set auth token to local storage
 * @param {string} token
 */
export function setToken(token) {
  try {
    if (!token) localStorage.removeItem(config.storageKey)
    else localStorage.setItem(config.storageKey, token)
  } catch {
    // ignore for demo
  }
}

export function clearToken() {
  setToken('')
}
