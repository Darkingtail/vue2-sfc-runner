/**
 * Vue 2 SFC Runner
 * Complete runtime for Vue 2 SFC with compilation, sandbox, and preview support
 *
 * @module vue2-sfc-runner
 */

// Re-export from vue2-sfc-compiler
export {
  createCompiler,
  createVue2JsxPreset,
  parseSFC,
  toUMD,
  COMP_IDENTIFIER,
} from 'vue2-sfc-compiler'

export type {
  CompilerOptions,
  CompileResult,
  CommonJSResult,
  UMDOptions,
  Compiler,
  BabelTransformFn,
  StylePreprocessors,
  StylePreprocessorFn,
  SFCDescriptor,
  Vue2JsxPresetOptions,
  Vue2JsxPreset,
} from 'vue2-sfc-compiler'

// Loader
export {
  loadScript,
  loadBabel,
  loadLess,
  loadSass,
  loadAllCDN,
  waitForBabel,
  isBabelLoaded,
  isLessLoaded,
  isSassLoaded,
} from './loader'

// Sandbox
export { generateSrcdoc, createSandbox } from './sandbox'
export type { SandboxOptions, Sandbox } from './sandbox'

// Renderer
export {
  createBrowserCompiler,
  createPreviewRenderer,
} from './renderer'
export type { PreviewRendererOptions, PreviewRenderer } from './renderer'

// Types
export type {
  CDNConfig,
  RunnerOptions,
  RunnerCompileResult,
  PreviewStatus,
  IframeMessage,
  PreviewOptions,
  Runner,
} from './types'

// Re-export default CDN config
export { DEFAULT_CDN } from './types'
