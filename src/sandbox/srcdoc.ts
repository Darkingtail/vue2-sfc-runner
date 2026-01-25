/**
 * Generate srcdoc HTML for iframe sandbox
 * This template provides Vue 2 runtime environment with CommonJS module system
 */

import { DEFAULT_CDN, type CDNConfig } from '../types'

/**
 * Generate custom styles link tags
 */
function generateStyleTags(styles: string[] = []): string {
  return styles.map((url) => `  <link rel="stylesheet" href="${url}">`).join('\n')
}

/**
 * Generate custom script tags
 */
function generateScriptTags(scripts: string[] = []): string {
  return scripts.map((url) => `  <script src="${url}"></script>`).join('\n')
}

/**
 * Escape JSON string for safe embedding in <script> tags
 * Prevents XSS by escaping characters that could break out of the script context
 */
function escapeJsonForScript(json: string): string {
  return json
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * Generate the srcdoc HTML for iframe preview
 * @param cdn - CDN configuration
 * @returns HTML string for iframe srcdoc
 */
export function generateSrcdoc(cdn: CDNConfig = {}): string {
  const vueCDN = cdn.vue || DEFAULT_CDN.vue
  const webpackPublicPath = cdn.webpackPublicPath || ''
  const customStyles = cdn.customStyles || []
  const customScripts = cdn.customScripts || []
  const globalConfig = cdn.globalConfig || {}

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Custom styles -->
${generateStyleTags(customStyles)}
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .error {
      color: #c00;
      padding: 16px;
      background: #fff0f0;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      margin: 8px 0;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f8f8f8;
    }

    ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  </style>
  <!-- Set webpack publicPath for UMD chunk lazy loading (must be before UMD scripts) -->
${webpackPublicPath ? `  <script>window.__webpack_public_path__ = "${webpackPublicPath}";</script>` : ''}
  <!-- Inject global config -->
  <script>window.$GLOBAL_CONFIG = ${escapeJsonForScript(JSON.stringify(globalConfig))};</script>
  <!-- Load Vue 2.7 via script tag (UMD version) -->
  <script src="${vueCDN}"></script>
  <!-- Custom scripts (loaded in order) -->
${generateScriptTags(customScripts)}
</head>
<body>
  <div id="app"></div>

  <script>
    // Error handling
    window.onerror = function (msg, source, line, col, error) {
      parent.postMessage({
        type: 'error',
        payload: {
          message: String(msg),
          source: source,
          line: line,
          column: col,
          stack: error?.stack
        }
      }, '*')
      return false
    }

    window.onunhandledrejection = function (e) {
      parent.postMessage({
        type: 'error',
        payload: {
          message: 'Unhandled Promise Rejection: ' + (e.reason?.message || e.reason)
        }
      }, '*')
    }

    // Console proxy
    const originalConsole = { ...console }
    ;['log', 'info', 'warn', 'error', 'debug'].forEach(method => {
      console[method] = (...args) => {
        originalConsole[method](...args)
        parent.postMessage({
          type: 'console',
          level: method,
          args: args.map(arg => {
            try {
              if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2)
              }
              return String(arg)
            } catch {
              return String(arg)
            }
          })
        }, '*')
      }
    })

    // Module system for CommonJS
    const modules = {}
    const moduleCache = {}

    function define(name, factory) {
      modules[name] = factory
    }

    function require(name) {
      // Handle vue special case - return Vue with proper default export for Babel interop
      if (name === 'vue' || name === 'Vue') {
        const Vue = window.Vue
        if (!Vue) {
          throw new Error('Vue not loaded. Please wait for Vue CDN to load.')
        }
        // Vue 2.7 Composition API - direct access (same as repl-vue2)
        return {
          default: Vue,
          ref: Vue.ref,
          reactive: Vue.reactive,
          computed: Vue.computed,
          watch: Vue.watch,
          watchEffect: Vue.watchEffect,
          onMounted: Vue.onMounted,
          onUnmounted: Vue.onUnmounted,
          onBeforeMount: Vue.onBeforeMount,
          onBeforeUnmount: Vue.onBeforeUnmount,
          onUpdated: Vue.onUpdated,
          onBeforeUpdate: Vue.onBeforeUpdate,
          onActivated: Vue.onActivated,
          onDeactivated: Vue.onDeactivated,
          onErrorCaptured: Vue.onErrorCaptured,
          provide: Vue.provide,
          inject: Vue.inject,
          toRef: Vue.toRef,
          toRefs: Vue.toRefs,
          unref: Vue.unref,
          isRef: Vue.isRef,
          shallowRef: Vue.shallowRef,
          triggerRef: Vue.triggerRef,
          shallowReactive: Vue.shallowReactive,
          shallowReadonly: Vue.shallowReadonly,
          readonly: Vue.readonly,
          isReactive: Vue.isReactive,
          isReadonly: Vue.isReadonly,
          isProxy: Vue.isProxy,
          markRaw: Vue.markRaw,
          toRaw: Vue.toRaw,
          nextTick: Vue.nextTick,
          defineComponent: Vue.defineComponent,
          defineAsyncComponent: Vue.defineAsyncComponent,
          getCurrentInstance: Vue.getCurrentInstance,
          h: Vue.h,
          Vue: Vue,
        }
      }

      // Handle element-ui special case (may be loaded via customScripts)
      if (name === 'element-ui' || name === 'ElementUI' || name === 'ELEMENT') {
        const ElementUI = window.ELEMENT
        if (!ElementUI) {
          throw new Error('Element UI not loaded. Please add it to customScripts.')
        }
        return {
          default: ElementUI,
          ...ElementUI,
        }
      }

      // Handle lodash special case
      if (name === 'lodash' || name === '_') {
        const lodash = window._
        if (!lodash) {
          throw new Error('Lodash not loaded. Please add it to customScripts.')
        }
        return lodash
      }

      // Check cache
      if (moduleCache[name]) {
        return moduleCache[name].exports
      }

      // Get module factory
      const factory = modules[name]
      if (!factory) {
        throw new Error('Module not found: ' + name)
      }

      // Create module
      const module = { exports: {} }
      moduleCache[name] = module
      factory(require, module, module.exports)
      return module.exports
    }

    // Make require global
    window.define = define
    window.require = require

    // Message handler for eval
    window.addEventListener('message', async (e) => {
      if (!e.data || typeof e.data !== 'object') return

      const { type, modules: moduleDefs, mainModule, css } = e.data

      if (type === 'eval') {
        try {
          // Clear module cache for fresh execution
          Object.keys(moduleCache).forEach(key => delete moduleCache[key])
          Object.keys(modules).forEach(key => delete modules[key])

          // Clear previous styles
          document.querySelectorAll('style[data-vue2-runner]').forEach(el => el.remove())

          // Destroy previous Vue instance and prepare container
          const existingApp = document.getElementById('app')
          if (window.__vue_app__) {
            window.__vue_app__.$destroy()
            window.__vue_app__ = null
          }
          if (existingApp) {
            existingApp.innerHTML = ''
          } else {
            document.body.innerHTML = '<div id="app"></div>'
          }

          // Inject CSS
          if (css) {
            const style = document.createElement('style')
            style.setAttribute('data-vue2-runner', '')
            style.textContent = css
            document.head.appendChild(style)
          }

          // Register modules
          if (moduleDefs) {
            for (const [name, code] of Object.entries(moduleDefs)) {
              try {
                const fn = new Function('require', 'module', 'exports', code)
                define(name, fn)
              } catch (err) {
                console.error('Failed to define module ' + name + ':', err)
              }
            }
          }

          // Load and mount main component
          if (mainModule) {
            try {
              const Component = require(mainModule)
              const app = Component.default || Component

              const container = document.getElementById('app')
              if (!container) {
                throw new Error('Container #app not found')
              }

              // Mount with Vue 2
              window.__vue_app__ = new window.Vue({
                render: h => h(app)
              }).$mount(container)

              // Notify parent that render is complete
              parent.postMessage({ type: 'rendered' }, '*')

            } catch (err) {
              console.error('Failed to mount component:', err)
              parent.postMessage({
                type: 'error',
                payload: { message: err.message, stack: err.stack }
              }, '*')
            }
          }
        } catch (err) {
          parent.postMessage({
            type: 'error',
            payload: { message: err.message, stack: err.stack }
          }, '*')
        }
      }
    })

    // Signal ready
    parent.postMessage({ type: 'ready' }, '*')
  </script>
</body>
</html>`
}
