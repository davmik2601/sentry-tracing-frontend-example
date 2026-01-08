import {config} from '../config.js'

/**
 * Get the origin of the API URL from the configuration.
 * @return {string}
 */
export function getApiOrigin() {
  try {
    return new URL(config.apiUrl).origin
  } catch {
    return ''
  }
}
