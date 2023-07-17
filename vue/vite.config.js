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

    // output: {
    //     // 微应用的包名，这里与主应用中注册的微应用名称一致
    //     library: 'VueMicroApp',
    //     // 将你的 library 暴露为所有的模块定义下都可运行的方式
    //     libraryTarget: 'umd',
    //     // 按需加载相关，设置为 webpackJsonp_VueMicroApp 即可
    //     jsonpFunction: `webpackJsonp_VueMicroApp`,
    // },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
