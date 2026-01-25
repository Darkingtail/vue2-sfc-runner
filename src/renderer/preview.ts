/**
 * Preview Renderer
 * High-level API for compiling and previewing Vue 2 SFC
 */

import type { Compiler } from 'vue2-sfc-compiler'
import { createBrowserCompiler, compileSFCToCommonJS } from './compiler'
import { createSandbox, type Sandbox, type SandboxOptions } from '../sandbox'
import { loadAllCDN, waitForBabel, isBabelLoaded } from '../loader'
import type { PreviewStatus, RunnerCompileResult } from '../types'

/**
 * Preview renderer options
 */
export interface PreviewRendererOptions extends Omit<SandboxOptions, 'container'> {
  /** Container element or selector */
  container: HTMLElement | string
  /** Auto-load CDN libraries */
  autoLoadCDN?: boolean
  /** CDN load timeout */
  loadTimeout?: number
}

/**
 * Preview renderer instance
 */
export interface PreviewRenderer {
  /** Get current status */
  getStatus(): PreviewStatus

  /** Compile SFC code */
  compile(code: string, filename?: string): Promise<RunnerCompileResult>

  /** Compile and preview SFC code */
  preview(code: string, filename?: string): Promise<void>

  /** Update preview with new code */
  update(code: string, filename?: string): Promise<void>

  /** Wait for Babel to be loaded */
  waitForBabel(timeout?: number): Promise<void>

  /** Check if Babel is loaded */
  isBabelLoaded(): boolean

  /** Destroy the renderer */
  destroy(): void
}

/**
 * Create a preview renderer
 */
export async function createPreviewRenderer(
  options: PreviewRendererOptions
): Promise<PreviewRenderer> {
  const {
    container,
    cdn = {},
    autoLoadCDN = true,
    loadTimeout = 30000,
    onReady,
    onRendered,
    onError,
    onConsole,
    onStatusChange,
  } = options

  let compiler: Compiler | null = null
  let sandbox: Sandbox | null = null
  let status: PreviewStatus = 'idle'

  // Update status
  const setStatus = (newStatus: PreviewStatus) => {
    status = newStatus
    onStatusChange?.(newStatus)
  }

  // Load CDN libraries if needed
  if (autoLoadCDN && !isBabelLoaded()) {
    setStatus('loading')
    await loadAllCDN(cdn, { timeout: loadTimeout })
  }

  // Create compiler
  compiler = createBrowserCompiler()

  // Create sandbox
  sandbox = createSandbox({
    container,
    cdn,
    onReady: () => {
      setStatus('ready')
      onReady?.()
    },
    onRendered,
    onError: (error) => {
      setStatus('error')
      onError?.(error)
    },
    onConsole,
  })

  // Compile SFC
  const compile = async (
    code: string,
    filename = 'Component.vue'
  ): Promise<RunnerCompileResult> => {
    if (!compiler) {
      return { js: '', css: '', errors: ['Compiler not initialized'] }
    }

    try {
      const result = await compileSFCToCommonJS(compiler, code, filename)
      return {
        js: result.js,
        css: result.css,
        errors: result.errors,
      }
    } catch (error) {
      return {
        js: '',
        css: '',
        errors: [error instanceof Error ? error.message : String(error)],
      }
    }
  }

  // Preview SFC
  const preview = async (code: string, filename = 'Component.vue') => {
    if (!sandbox) {
      throw new Error('Sandbox not initialized')
    }

    const result = await compile(code, filename)

    if (result.errors.length > 0) {
      onError?.({ message: result.errors.join('\n') })
      return
    }

    // Execute in sandbox
    sandbox.execute(
      { [filename]: result.js },
      filename,
      result.css
    )
  }

  // Update preview
  const update = preview

  // Destroy renderer
  const destroy = () => {
    sandbox?.destroy()
    sandbox = null
    compiler = null
    setStatus('idle')
  }

  return {
    getStatus: () => status,
    compile,
    preview,
    update,
    waitForBabel,
    isBabelLoaded,
    destroy,
  }
}
