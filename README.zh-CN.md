# vue2-sfc-runner

Vue 2 SFC 运行时环境，提供浏览器端编译和 iframe 沙箱预览能力。

## 作用与目的

本包是 `vue2-sfc-compiler` 的上层封装，专为浏览器环境设计，提供：

- **CDN 加载器**：按需加载 Babel、Less、Sass 等编译依赖
- **浏览器编译器**：预配置的编译器，开箱即用
- **iframe 沙箱**：隔离的预览环境，支持自定义 Vue 插件和组件库
- **预览渲染器**：高级 API，一键完成编译和预览

## 包结构

```
vue2-sfc-runner/
├── src/
│   ├── index.ts              # 入口，统一导出所有模块
│   ├── types.ts              # 类型定义
│   ├── loader/               # CDN 加载器
│   │   ├── index.ts          # 加载器入口
│   │   └── cdn.ts            # CDN 资源加载
│   ├── sandbox/              # iframe 沙箱
│   │   ├── index.ts          # 沙箱入口
│   │   ├── iframe.ts         # iframe 管理
│   │   └── srcdoc.ts         # iframe HTML 模板生成
│   └── renderer/             # 预览渲染
│       ├── index.ts          # 渲染器入口
│       ├── compiler.ts       # 浏览器编译器封装
│       └── preview.ts        # 预览渲染器
├── dist/                     # 构建产物
├── package.json
└── tsup.config.ts
```

## 文件说明

| 文件/目录 | 作用 |
|-----------|------|
| `index.ts` | 包入口，重新导出所有子模块和 `vue2-sfc-compiler` |
| `types.ts` | CDNConfig、PreviewStatus、IframeMessage 等类型 |
| `loader/cdn.ts` | 动态加载 Babel、Less、Sass 等 CDN 资源 |
| `sandbox/srcdoc.ts` | 生成 iframe 的 srcdoc HTML，配置 Vue 运行环境 |
| `sandbox/iframe.ts` | 创建和管理 iframe 实例，处理 postMessage 通信 |
| `renderer/compiler.ts` | 创建浏览器编译器，自动配置 Babel 和样式预处理器 |
| `renderer/preview.ts` | 高级预览 API，整合编译器和沙箱 |

## 使用场景

- **组件预览**：在线编辑器中实时预览 Vue 2 组件
- **低代码平台**：运行用户配置的组件代码
- **文档演示**：交互式组件示例

## 使用方法

### 方式一：直接使用编译器和沙箱（推荐）

```javascript
import {
  createBrowserCompiler,
  generateSrcdoc,
} from 'vue2-sfc-runner'

// 1. 生成 iframe srcdoc（包含 Vue 运行环境）
const srcdoc = generateSrcdoc({
  vue: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js',
  customScripts: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/index.js',
  ],
  customStyles: [
    'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/theme-chalk/index.css',
  ],
})

// 2. 设置 iframe
const iframe = document.getElementById('preview')
iframe.srcdoc = srcdoc

// 3. 编译 SFC 为 CommonJS
const compiler = createBrowserCompiler()
const result = await compiler.compileToCommonJS(sfcCode, 'App')

// 4. 发送到 iframe 执行
iframe.contentWindow.postMessage({
  type: 'eval',
  modules: { 'App.vue': result.js },
  mainModule: 'App.vue',
  css: result.css,
}, '*')
```

### 方式二：使用预览渲染器（高级封装）

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

// 预览组件
await renderer.preview(sfcCode)

// 更新预览
await renderer.update(newSfcCode)

// 销毁
renderer.destroy()
```

### 方式三：仅使用 CDN 加载器

```javascript
import { loadBabel, loadLess, waitForBabel } from 'vue2-sfc-runner'

// 加载 Babel
await loadBabel()
await waitForBabel()

// 现在可以使用 window.Babel
```

## CDN 配置

```typescript
interface CDNConfig {
  babel?: string              // Babel standalone CDN
  vue?: string                // Vue 2.7 CDN（iframe 内使用）
  less?: string               // Less.js CDN
  sass?: string               // Sass.js CDN
  webpackPublicPath?: string  // UMD chunk 懒加载路径
  customScripts?: string[]    // 自定义 JS（如组件库）
  customStyles?: string[]     // 自定义 CSS
}
```

## iframe 消息协议

主应用与 iframe 通过 postMessage 通信：

**发送到 iframe：**
```javascript
{
  type: 'eval',
  modules: { 'App.vue': compiledJs },
  mainModule: 'App.vue',
  css: compiledCss,
}
```

**从 iframe 接收：**
```javascript
{ type: 'ready' }                    // iframe 就绪
{ type: 'rendered' }                 // 组件渲染完成
{ type: 'error', payload: {...} }    // 运行时错误
{ type: 'console', level, args }     // 控制台输出
```

## 依赖关系

```
vue2-sfc-runner
    │
    └── vue2-sfc-compiler（已内置 JSX 支持）
```

本包重新导出了 `vue2-sfc-compiler` 的所有 API，使用时只需安装 `vue2-sfc-runner` 即可获得全部功能（包括 JSX 编译能力）。
