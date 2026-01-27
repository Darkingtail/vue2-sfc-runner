/**
 * Browser Compiler
 * Creates compiler instance with browser-loaded Babel and style preprocessors
 * All compilation is done by vue2-sfc-compiler, this module only provides configuration
 */

import { createCompiler, createVue2JsxPreset } from 'vue2-sfc-compiler'
import type { Compiler, BabelTransformFn } from 'vue2-sfc-compiler'

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
 * Uses @babel/standalone loaded via CDN
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
 * All compilation methods (compileSFC, compileToCommonJS, compileToUMD) are provided by vue2-sfc-compiler
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
