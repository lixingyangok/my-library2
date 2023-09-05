import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            alias: {
                '@': resolve('src/renderer/src'),
                '@renderer': resolve('src/renderer/src'),
            },
        },
        plugins: [vue()],
        server: {
            proxy: {
                "/api": {
                    target: "http://localhost:8899",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                },
            },
        },
    },
});

