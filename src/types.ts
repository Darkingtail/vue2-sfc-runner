/**
 * Type definitions for vue2-sfc-runner
 */

/**
 * CDN configuration for external libraries
 */
export interface CDNConfig {
  /** Babel standalone CDN URL (loaded in main app for compilation) */
  babel?: string
  /** Vue 2.7 CDN URL (loaded in iframe for runtime) */
  vue?: string
  /** Less.js CDN URL (loaded in main app for style compilation) */
  less?: string
  /** Sass.js CDN URL (loaded in main app for style compilation) */
  sass?: string
  /** Webpack publicPath for UMD chunk lazy loading (must end with /) */
  webpackPublicPath?: string
  /** Custom JS scripts to load in iframe (loaded in order, after Vue) */
  customScripts?: string[]
  /** Custom CSS styles to load in iframe */
  customStyles?: string[]
  /** Global config to inject as window.$GLOBAL_CONFIG */
  globalConfig?: Record<string, unknown>
}

/**
 * Base CDN configuration (without custom scripts/styles)
 */
export type BaseCDNConfig = Pick<CDNConfig, 'babel' | 'vue' | 'less' | 'sass'>

/**
 * Default CDN URLs
 */
export const DEFAULT_CDN: Required<BaseCDNConfig> = {
  babel: 'https://cdn.bootcdn.net/ajax/libs/babel-standalone/7.22.17/babel.min.js',
  vue: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
  less: 'https://cdn.bootcdn.net/ajax/libs/less.js/4.2.0/less.min.js',
  sass: 'https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.min.js',
}

/**
 * Runner options
 */
export interface RunnerOptions {
  /** CDN configuration */
  cdn?: CDNConfig
  /** Timeout for CDN loading (ms) */
  loadTimeout?: number
}

/**
 * Compile result from the runner
 */
export interface RunnerCompileResult {
  /** Compiled JavaScript (CommonJS format) */
  js: string
  /** Compiled CSS */
  css: string
  /** Compilation errors */
  errors: string[]
}

/**
 * Preview status
 */
export type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Message types from iframe
 */
export interface IframeMessage {
  type: 'ready' | 'rendered' | 'error' | 'console'
  payload?: {
    message?: string
    stack?: string
    source?: string
    line?: number
    column?: number
  }
  level?: 'log' | 'info' | 'warn' | 'error' | 'debug'
  args?: string[]
}

/**
 * Preview options
 */
export interface PreviewOptions {
  /** Target container element or selector */
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
}

/**
 * Runner instance interface
 */
export interface Runner {
  /** Compile SFC code */
  compile(code: string, filename?: string): Promise<RunnerCompileResult>

  /** Compile and preview in sandbox */
  preview(code: string, filename?: string): Promise<void>

  /** Update preview with new code */
  update(code: string, filename?: string): Promise<void>

  /** Destroy the runner and cleanup */
  destroy(): void

  /** Check if Babel is loaded */
  isBabelLoaded(): boolean

  /** Wait for Babel to be loaded */
  waitForBabel(timeout?: number): Promise<void>
}

/**
 * Browser globals for CDN libraries
 */
declare global {
  interface Window {
    Babel?: {
      transform: (
        code: string,
        options: {
          filename?: string
          plugins?: unknown[]
          presets?: unknown[]
        }
      ) => { code: string } | null
    }
    less?: {
      render: (source: string) => Promise<{ css: string }>
    }
    Sass?: {
      compile: (
        source: string,
        callback: (result: {
          status: number
          text?: string
          message?: string
          formatted?: string
        }) => void
      ) => void
    }
    Vue?: unknown
    /** Webpack public path for dynamic chunk loading */
    __webpack_public_path__?: string
    /** Global config injected from CDN configuration */
    $GLOBAL_CONFIG?: Record<string, unknown>
  }
}
