/**
 * Iframe Sandbox Manager
 * Creates and manages iframe for component preview
 */

import { generateSrcdoc } from './srcdoc'
import type { CDNConfig, IframeMessage, PreviewStatus } from '../types'

/**
 * Sandbox options
 */
export interface SandboxOptions {
  /** Container element or selector */
  container: HTMLElement | string
  /** CDN configuration */
  cdn?: CDNConfig
  /** Callback when iframe is ready */
  onReady?: () => void
  /** Callback when component is rendered */
  onRendered?: () => void
  /** Callback when error occurs */
  onError?: (error: { message: string; stack?: string }) => void
  /** Callback for console messages */
  onConsole?: (level: string, args: string[]) => void
  /** Callback when status changes */
  onStatusChange?: (status: PreviewStatus) => void
}

/**
 * Sandbox instance
 */
export interface Sandbox {
  /** Get the iframe element */
  getIframe(): HTMLIFrameElement | null

  /** Get current status */
  getStatus(): PreviewStatus

  /** Execute code in sandbox */
  execute(modules: Record<string, string>, mainModule: string, css?: string): void

  /** Destroy the sandbox */
  destroy(): void
}

/**
 * Create an iframe sandbox for component preview
 */
export function createSandbox(options: SandboxOptions): Sandbox {
  const {
    container,
    cdn = {},
    onReady,
    onRendered,
    onError,
    onConsole,
    onStatusChange,
  } = options

  let iframe: HTMLIFrameElement | null = null
  let status: PreviewStatus = 'idle'
  let messageHandler: ((e: MessageEvent) => void) | null = null

  // Get container element
  const getContainer = (): HTMLElement | null => {
    if (typeof container === 'string') {
      return document.querySelector(container)
    }
    return container
  }

  // Update status
  const setStatus = (newStatus: PreviewStatus) => {
    status = newStatus
    onStatusChange?.(newStatus)
  }

  // Handle messages from iframe
  const handleMessage = (e: MessageEvent) => {
    if (!iframe || e.source !== iframe.contentWindow) return

    const data = e.data as IframeMessage
    if (!data || typeof data !== 'object') return

    switch (data.type) {
      case 'ready':
        setStatus('ready')
        onReady?.()
        break

      case 'rendered':
        onRendered?.()
        break

      case 'error':
        setStatus('error')
        if (data.payload) {
          onError?.({
            message: data.payload.message || 'Unknown error',
            stack: data.payload.stack,
          })
        }
        break

      case 'console':
        if (data.level && data.args) {
          onConsole?.(data.level, data.args)
        }
        break
    }
  }

  // Initialize iframe
  const init = () => {
    const containerEl = getContainer()
    if (!containerEl) {
      console.error('[Sandbox] Container not found')
      return
    }

    // Create iframe
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;'
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
    iframe.srcdoc = generateSrcdoc(cdn)

    // Add message listener
    messageHandler = handleMessage
    window.addEventListener('message', messageHandler)

    // Set loading status
    setStatus('loading')

    // Append to container
    containerEl.innerHTML = ''
    containerEl.appendChild(iframe)
  }

  // Execute code in sandbox
  const execute = (
    modules: Record<string, string>,
    mainModule: string,
    css?: string
  ) => {
    if (!iframe || !iframe.contentWindow) {
      console.error('[Sandbox] Iframe not ready')
      return
    }

    iframe.contentWindow.postMessage(
      {
        type: 'eval',
        modules,
        mainModule,
        css,
      },
      '*'
    )
  }

  // Destroy sandbox
  const destroy = () => {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler)
      messageHandler = null
    }

    if (iframe) {
      iframe.remove()
      iframe = null
    }

    setStatus('idle')
  }

  // Initialize on creation
  init()

  return {
    getIframe: () => iframe,
    getStatus: () => status,
    execute,
    destroy,
  }
}
