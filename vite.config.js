import { cpSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(fileURLToPath(import.meta.url))

function copySwissEphAssets() {
  let outDir = 'dist'

  return {
    name: 'copy-swisseph-wasm-assets',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir || outDir
    },
    closeBundle() {
      const source = resolve(__dirname, 'node_modules/swisseph-wasm/wasm')
      const target = resolve(__dirname, outDir, 'wasm')

      if (!existsSync(source)) {
        this.warn('SwissEph WASM assets not found; build may be missing ephemeris data.')
        return
      }

      try {
        cpSync(source, target, { recursive: true })
      } catch (error) {
        this.warn(`Failed to copy SwissEph WASM assets: ${error}`)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), copySwissEphAssets()],
  server: {
    port: 5173
  },
  assetsInclude: ['**/*.wasm', '**/*.data'],
  optimizeDeps: {
    exclude: ['swisseph-wasm']
  }
})
