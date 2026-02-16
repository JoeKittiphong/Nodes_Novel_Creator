import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@xyflow/react': path.resolve(__dirname, 'node_modules/@xyflow/react'),
        },
    },
    optimizeDeps: {
        include: ['@xyflow/react', '@xyflow/system', 'react', 'react-dom'],
    },
    ssr: {
        noExternal: ['@xyflow/react', '@xyflow/system'],
    },
})
