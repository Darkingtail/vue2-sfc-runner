/**
 * Browser Compiler
 * Wraps vue2-sfc-compiler for browser use with CDN-loaded Babel
 */

import { createCompiler, createVue2JsxPreset } from 'vue2-sfc-compiler'
import type { Compiler, CompileResult, BabelTransformFn } from 'vue2-sfc-compiler'

/**
 * Style preprocessor for Less
 */
async function lessPreprocessor(source: string): Promise<string> {
  if (!window.less) {
    console.warn('[Compiler] less.js not loaded. LESS styles will not be compiled.')
    return source
  }
  try {
    const result = await window.less.render(source)
    return result.css
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`LESS compile error: ${msg}`)
  }
}

/**
 * Style preprocessor for SCSS/SASS
 */
async function scssPreprocessor(source: string): Promise<string> {
  if (!window.Sass) {
    console.warn('[Compiler] sass.js not loaded. SCSS/SASS styles will not be compiled.')
    return source
  }
  return new Promise<string>((resolve, reject) => {
    window.Sass!.compile(source, (result) => {
      if (result.status === 0 && result.text) {
        resolve(result.text)
      } else {
        reject(
          new Error(
            `SCSS compile error: ${result.message || result.formatted || 'Unknown error'}`
          )
        )
      }
    })
  })
}

/**
 * Babel transform function for browser
 */
const babelTransform: BabelTransformFn = (code, options) => {
  if (!window.Babel) {
    throw new Error('[Compiler] Babel standalone is not loaded.')
  }

  const result = window.Babel.transform(code, {
    filename: options.filename ?? undefined,
    presets: options.presets as unknown[] | undefined,
    plugins: options.plugins as unknown[] | undefined,
  })

  return result?.code || ''
}

/**
 * Create a browser-compatible compiler instance
 */
export function createBrowserCompiler(): Compiler {
  return createCompiler({
    babelTransform: babelTransform as BabelTransformFn,
    stylePreprocessors: {
      less: lessPreprocessor,
      scss: scssPreprocessor,
      sass: scssPreprocessor,
    },
    vue2JsxPreset: createVue2JsxPreset(null),
  })
}

/**
 * Convert ES modules to CommonJS for sandbox execution
 */
export function toCommonJS(esCode: string): string {
  if (!window.Babel) {
    throw new Error('[Compiler] Babel standalone is not loaded.')
  }

  const result = window.Babel.transform(esCode, {
    presets: [['env', { modules: 'cjs' }]],
  })

  let cjsCode = result?.code || esCode

  // Fix Vue.extend() issue for Vue 2
  cjsCode = cjsCode.replace(/_vue\["default"]\.extend\({/g, '({')
  cjsCode = cjsCode.replace(/_vue\.default\.extend\({/g, '({')

  return cjsCode
}

/**
 * Compile SFC and convert to CommonJS
 * vue2-sfc-compiler outputs ES module format, we convert to CommonJS for sandbox
 */
export async function compileSFCToCommonJS(
  compiler: Compiler,
  code: string,
  name = 'Component'
): Promise<CompileResult> {
  const result = await compiler.compileSFC(code, name)

  if (result.errors.length > 0) {
    return result
  }

  // Convert ES module to CommonJS for sandbox execution
  let jsCode = toCommonJS(result.js)

  // Fix Vue.extend() issue for Vue 2
  jsCode = jsCode.replace(/_vue\["default"]\.extend\({/g, '({')
  jsCode = jsCode.replace(/_vue\.default\.extend\({/g, '({')

  return {
    js: jsCode,
    css: result.css,
    errors: result.errors,
    name: result.name,
  }
}
