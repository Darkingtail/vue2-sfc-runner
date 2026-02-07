import { describe, it, expect } from 'vitest';
import {
  // Re-exports from vue2-sfc-compiler
  createCompiler,
  createVue2JsxPreset,
  parseSFC,
  toUMD,
  COMP_IDENTIFIER,
  // Types
  DEFAULT_CDN,
} from '../src/index';

// --- Re-exports ---

describe('re-exports from vue2-sfc-compiler', () => {
  it('should export createCompiler', () => {
    expect(createCompiler).toBeDefined();
    expect(typeof createCompiler).toBe('function');
  });

  it('should export createVue2JsxPreset', () => {
    expect(createVue2JsxPreset).toBeDefined();
    expect(typeof createVue2JsxPreset).toBe('function');
  });

  it('should export parseSFC', () => {
    expect(parseSFC).toBeDefined();
    expect(typeof parseSFC).toBe('function');
  });

  it('should export toUMD', () => {
    expect(toUMD).toBeDefined();
    expect(typeof toUMD).toBe('function');
  });

  it('should export COMP_IDENTIFIER as __sfc__', () => {
    expect(COMP_IDENTIFIER).toBe('__sfc__');
  });
});

// --- DEFAULT_CDN ---

describe('DEFAULT_CDN', () => {
  it('should have babel URL', () => {
    expect(DEFAULT_CDN.babel).toBeDefined();
    expect(DEFAULT_CDN.babel).toContain('babel');
  });

  it('should have vue URL', () => {
    expect(DEFAULT_CDN.vue).toBeDefined();
    expect(DEFAULT_CDN.vue).toContain('vue');
  });

  it('should have less URL', () => {
    expect(DEFAULT_CDN.less).toBeDefined();
    expect(DEFAULT_CDN.less).toContain('less');
  });

  it('should have sass URL', () => {
    expect(DEFAULT_CDN.sass).toBeDefined();
    expect(DEFAULT_CDN.sass).toContain('sass');
  });

  it('should use vue 2.7.x', () => {
    expect(DEFAULT_CDN.vue).toContain('2.7');
  });
});

// --- generateSrcdoc ---
// generateSrcdoc depends on DOM (document), test the import

describe('module imports', () => {
  it('should export generateSrcdoc function', async () => {
    const mod = await import('../src/sandbox/srcdoc');
    expect(mod.generateSrcdoc).toBeDefined();
    expect(typeof mod.generateSrcdoc).toBe('function');
  });

  it('generateSrcdoc should generate HTML with default CDN', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const html = generateSrcdoc();

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain(DEFAULT_CDN.vue);
    expect(html).toContain('parent.postMessage');
  });

  it('generateSrcdoc should use custom vue CDN', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const customVue = 'https://cdn.example.com/vue.js';
    const html = generateSrcdoc({ vue: customVue });

    expect(html).toContain(customVue);
    expect(html).not.toContain(DEFAULT_CDN.vue);
  });

  it('generateSrcdoc should include custom scripts', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const html = generateSrcdoc({
      customScripts: ['https://cdn.example.com/lib1.js', 'https://cdn.example.com/lib2.js'],
    });

    expect(html).toContain('https://cdn.example.com/lib1.js');
    expect(html).toContain('https://cdn.example.com/lib2.js');
  });

  it('generateSrcdoc should include custom styles', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const html = generateSrcdoc({
      customStyles: ['https://cdn.example.com/style.css'],
    });

    expect(html).toContain('https://cdn.example.com/style.css');
  });

  it('generateSrcdoc should inject globalConfig', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const html = generateSrcdoc({
      globalConfig: { apiUrl: 'https://api.example.com' },
    });

    expect(html).toContain('$GLOBAL_CONFIG');
    expect(html).toContain('https://api.example.com');
  });

  it('generateSrcdoc should inject webpack publicPath', async () => {
    const { generateSrcdoc } = await import('../src/sandbox/srcdoc');
    const html = generateSrcdoc({
      webpackPublicPath: 'https://cdn.example.com/assets/',
    });

    expect(html).toContain('__webpack_public_path__');
    expect(html).toContain('https://cdn.example.com/assets/');
  });
});

// --- Loader exports ---

describe('loader exports', () => {
  it('should export loadScript', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.loadScript).toBeDefined();
    expect(typeof mod.loadScript).toBe('function');
  });

  it('should export loadBabel', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.loadBabel).toBeDefined();
    expect(typeof mod.loadBabel).toBe('function');
  });

  it('should export loadLess', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.loadLess).toBeDefined();
    expect(typeof mod.loadLess).toBe('function');
  });

  it('should export loadSass', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.loadSass).toBeDefined();
    expect(typeof mod.loadSass).toBe('function');
  });

  it('should export isBabelLoaded', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.isBabelLoaded).toBeDefined();
    expect(typeof mod.isBabelLoaded).toBe('function');
  });

  it('should export isLessLoaded', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.isLessLoaded).toBeDefined();
    expect(typeof mod.isLessLoaded).toBe('function');
  });

  it('should export isSassLoaded', async () => {
    const mod = await import('../src/loader/cdn');
    expect(mod.isSassLoaded).toBeDefined();
    expect(typeof mod.isSassLoaded).toBe('function');
  });
});

// --- Sandbox exports ---

describe('sandbox exports', () => {
  it('should export createSandbox', async () => {
    const mod = await import('../src/sandbox/iframe');
    expect(mod.createSandbox).toBeDefined();
    expect(typeof mod.createSandbox).toBe('function');
  });
});

// --- Renderer exports ---

describe('renderer exports', () => {
  it('should export createBrowserCompiler', async () => {
    const mod = await import('../src/renderer/compiler');
    expect(mod.createBrowserCompiler).toBeDefined();
    expect(typeof mod.createBrowserCompiler).toBe('function');
  });

  it('should export createPreviewRenderer', async () => {
    const mod = await import('../src/renderer/preview');
    expect(mod.createPreviewRenderer).toBeDefined();
    expect(typeof mod.createPreviewRenderer).toBe('function');
  });
});

// --- parseSFC (via re-export) ---

describe('parseSFC (via re-export)', () => {
  it('should parse a basic SFC', () => {
    const code = `
<template><div>Hello</div></template>
<script>export default { name: 'Hello' }</script>
<style>.hello { color: red; }</style>`;
    const result = parseSFC(code, 'Hello.vue');

    expect(result.filename).toBe('Hello.vue');
    expect(result.template).not.toBeNull();
    expect(result.script).not.toBeNull();
    expect(result.styles).toHaveLength(1);
  });

  it('should parse SFC with script setup', () => {
    const code = `
<template><div>{{ msg }}</div></template>
<script setup>
const msg = 'hello'
</script>`;
    const result = parseSFC(code, 'Setup.vue');

    expect(result.scriptSetup).not.toBeNull();
    expect(result.scriptSetup!.content).toContain("const msg = 'hello'");
  });
});
