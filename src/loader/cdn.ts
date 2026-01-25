/**
 * CDN Loader
 * Dynamically loads external libraries (Babel, Less, Sass) via CDN
 */

import { DEFAULT_CDN, type CDNConfig } from '../types'

/** Track loaded scripts to avoid duplicate loading */
const loadedScripts = new Set<string>()

/** Track loading promises to avoid duplicate requests */
const loadingPromises = new Map<string, Promise<void>>()

/**
 * Load a script from CDN
 * @param url - Script URL
 * @param timeout - Load timeout in ms
 * @returns Promise that resolves when script is loaded
 */
export function loadScript(url: string, timeout = 30000): Promise<void> {
  // Already loaded
  if (loadedScripts.has(url)) {
    return Promise.resolve()
  }

  // Already loading
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true

    const timeoutId = setTimeout(() => {
      reject(new Error(`Script load timeout: ${url}`))
    }, timeout)

    script.onload = () => {
      clearTimeout(timeoutId)
      loadedScripts.add(url)
      loadingPromises.delete(url)
      resolve()
    }

    script.onerror = () => {
      clearTimeout(timeoutId)
      loadingPromises.delete(url)
      reject(new Error(`Failed to load script: ${url}`))
    }

    document.head.appendChild(script)
  })

  loadingPromises.set(url, promise)
  return promise
}

/**
 * Load Babel standalone
 */
export async function loadBabel(cdn: CDNConfig = {}, timeout?: number): Promise<void> {
  const url = cdn.babel || DEFAULT_CDN.babel
  await loadScript(url, timeout)

  if (!window.Babel) {
    throw new Error('Babel loaded but window.Babel is not available')
  }
}

/**
 * Load Less.js
 */
export async function loadLess(cdn: CDNConfig = {}, timeout?: number): Promise<void> {
  const url = cdn.less || DEFAULT_CDN.less
  await loadScript(url, timeout)

  if (!window.less) {
    throw new Error('Less loaded but window.less is not available')
  }
}

/**
 * Load Sass.js
 */
export async function loadSass(cdn: CDNConfig = {}, timeout?: number): Promise<void> {
  const url = cdn.sass || DEFAULT_CDN.sass
  await loadScript(url, timeout)

  if (!window.Sass) {
    throw new Error('Sass loaded but window.Sass is not available')
  }
}

/**
 * Load all required CDN libraries
 * Babel is required, Less and Sass are optional
 */
export async function loadAllCDN(
  cdn: CDNConfig = {},
  options: { timeout?: number; loadStyles?: boolean } = {}
): Promise<void> {
  const { timeout = 30000, loadStyles = true } = options

  // Always load Babel
  await loadBabel(cdn, timeout)

  // Optionally load style preprocessors
  if (loadStyles) {
    await Promise.all([
      loadLess(cdn, timeout).catch((err) => {
        console.warn('[Runner] Less.js not loaded:', err.message)
      }),
      loadSass(cdn, timeout).catch((err) => {
        console.warn('[Runner] Sass.js not loaded:', err.message)
      }),
    ])
  }
}

/**
 * Wait for Babel to be available
 */
export async function waitForBabel(timeout = 10000): Promise<void> {
  const startTime = Date.now()
  while (!window.Babel) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Babel standalone is not loaded within timeout')
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

/**
 * Check if Babel is loaded
 */
export function isBabelLoaded(): boolean {
  return !!window.Babel
}

/**
 * Check if Less is loaded
 */
export function isLessLoaded(): boolean {
  return !!window.less
}

/**
 * Check if Sass is loaded
 */
export function isSassLoaded(): boolean {
  return !!window.Sass
}
