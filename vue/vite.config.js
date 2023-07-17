import { fileURLToPath, URL } from 'node:url'
import qiankun from 'vite-plugin-qiankun'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // qiankun的第一个参数必须与主应用在main.ts中registerMicroApps的name值一致
        qiankun('VueMicroApp', {
            useDevMode: true,
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 5000,
        // 关闭主机检查，使微应用可以被 fetch
        disableHostCheck: true,
        // 配置跨域请求头，解决开发环境的跨域问题
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
