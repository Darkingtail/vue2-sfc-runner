# vue2-sfc-runner

[中文文档](./README.zh-CN.md)

Vue 2 SFC runtime with browser-based compilation and iframe sandbox preview capabilities.

## Purpose

This package is a higher-level wrapper around `vue2-sfc-compiler`, designed specifically for browser environments:

- **CDN Loader**: Load Babel, Less, Sass and other compilation dependencies on demand
- **Browser Compiler**: Pre-configured compiler, ready to use out of the box
- **iframe Sandbox**: Isolated preview environment with support for custom Vue plugins and component libraries
- **Preview Renderer**: High-level API for one-step compilation and preview

## Package Structure

```
vue2-sfc-runner/
├── src/
│   ├── index.ts              # Entry, exports all modules
│   ├── types.ts              # Type definitions
│   ├── loader/               # CDN loader
│   │   ├── index.ts          # Loader entry
│   │   └── cdn.ts            # CDN resource loading
│   ├── sandbox/              # iframe sandbox
│   │   ├── index.ts          # Sandbox entry
│   │   ├── iframe.ts         # iframe management
│   │   └── srcdoc.ts         # iframe HTML template generation
│   └── renderer/             # Preview rendering
│       ├── index.ts          # Renderer entry
│       ├── compiler.ts       # Browser compiler wrapper
│       └── preview.ts        # Preview renderer
├── dist/                     # Build output
├── package.json
└── tsup.config.ts
```

## File Description

| File/Directory | Purpose |
|----------------|---------|
| `index.ts` | Package entry, re-exports all submodules and `vue2-sfc-compiler` |
| `types.ts` | CDNConfig, PreviewStatus, IframeMessage types |
| `loader/cdn.ts` | Dynamically load CDN resources (Babel, Less, Sass, etc.) |
| `sandbox/srcdoc.ts` | Generate iframe srcdoc HTML, configure Vue runtime environment |
| `sandbox/iframe.ts` | Create and manage iframe instances, handle postMessage communication |
| `renderer/compiler.ts` | Creates browser compiler with auto-configured Babel and style preprocessors |
| `renderer/preview.ts` | High-level preview API, integrates compiler and sandbox |

## Use Cases

- **Component Preview**: Real-time Vue 2 component preview in online editors
- **Low-code Platforms**: Run user-configured component code
- **Documentation Demos**: Interactive component examples

## Usage

### Method 1: Direct Compiler and Sandbox (Recommended)

```javascript
import {
  createBrowserCompiler,
  generateSrcdoc,
} from 'vue2-sfc-runner'

// 1. Generate iframe srcdoc (includes Vue runtime environment)
const srcdoc = generateSrcdoc({
  vue: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js',
  customScripts: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/index.js',
  ],
  customStyles: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/theme-chalk/index.css',
  ],
})

// 2. Set up iframe
const iframe = document.getElementById('preview')
iframe.srcdoc = srcdoc

// 3. Compile SFC to CommonJS
const compiler = createBrowserCompiler()
const result = await compiler.compileToCommonJS(sfcCode, 'App')

// 4. Send to iframe for execution
iframe.contentWindow.postMessage({
  type: 'eval',
  modules: { 'App.vue': result.js },
  mainModule: 'App.vue',
  css: result.css,
}, '*')
```

### Method 2: Preview Renderer (High-level API)

```javascript
import { createPreviewRenderer } from 'vue2-sfc-runner'

const renderer = await createPreviewRenderer({
  container: '#preview-container',
  cdn: {
    vue: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js',
  },
  onReady: () => console.log('Preview ready'),
  onError: (err) => console.error('Error:', err),
})

// Preview component
await renderer.preview(sfcCode)

// Update preview
await renderer.update(newSfcCode)

// Destroy
renderer.destroy()
```

### Method 3: CDN Loader Only

```javascript
import { loadBabel, loadLess, waitForBabel } from 'vue2-sfc-runner'

// Load Babel
await loadBabel()
await waitForBabel()

// Now window.Babel is available
```

## CDN Configuration

```typescript
interface CDNConfig {
  babel?: string              // Babel standalone CDN
  vue?: string                // Vue 2.7 CDN (used inside iframe)
  less?: string               // Less.js CDN
  sass?: string               // Sass.js CDN
  webpackPublicPath?: string  // UMD chunk lazy loading path
  customScripts?: string[]    // Custom JS (e.g., component libraries)
  customStyles?: string[]     // Custom CSS
}
```

## iframe Message Protocol

Main application communicates with iframe via postMessage:

**Send to iframe:**
```javascript
{
  type: 'eval',
  modules: { 'App.vue': compiledJs },
  mainModule: 'App.vue',
  css: compiledCss,
}
```

**Receive from iframe:**
```javascript
{ type: 'ready' }                    // iframe ready
{ type: 'rendered' }                 // Component rendered
{ type: 'error', payload: {...} }    // Runtime error
{ type: 'console', level, args }     // Console output
```

## Dependencies

```
vue2-sfc-runner
    │
    └── vue2-sfc-compiler (with built-in JSX support)
```

This package re-exports all APIs from `vue2-sfc-compiler`. Simply install `vue2-sfc-runner` to get full functionality including JSX compilation capabilities.

## License

MIT
