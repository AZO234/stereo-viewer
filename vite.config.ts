import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// CI 環境では VITE_BASE_PATH にリポジトリ名が入る
// (例: /stereo-viewer/)
// ローカル開発時は './' のまま動作する
const base = process.env.VITE_BASE_PATH ?? './'

export default defineConfig({
  plugins: [vue()],
  base,
})
