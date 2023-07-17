# 基于 qiankun 的微前端实践

[qiankun 官网](https://qiankun.umijs.org/zh)

## 主应用搭建

主应用是用 vite+vue3 搭建（建议主应用不要用vite+vue3，vue-cli+vue2比较稳妥）

-   App.vue 文件

```js
<template>
    <div class="container">
        <div class="nav">
            <RouterLink :to="item.path" v-for="(item, index) in navList" :key="index">{{ item.name
            }}</RouterLink>
        </div>
        <!-- 主应用渲染区，用于挂载主应用路由触发的组件 -->
        <div class="content" v-if="routeName">
            <RouterView />
        </div>
        <!-- 子应用渲染区，用于挂载子应用节点 -->
        <div class="content" id="frame" v-if="!routeName">
            <RouterView />
        </div>
    </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted, computed } from 'vue';
import { registerMicroApps, start } from 'qiankun'
import { useRoute } from 'vue-router';
const route = useRoute()
const navList = ref([
    {
        name: '主应用',
        path: '/'
    },
    {
        name: '子应用vue',
        path: '/vue'
    },
    {
        name: '子应用react',
        path: '/react'
    },
    {
        name: '子应用Vue2',
        path: '/vue2'
    },
])

const routeName = computed(() => {
    return route.name
})

onMounted(() => {
    // 注册微应用
    registerMicroApps([
        {
            name: 'VueMicroApp',
            entry: 'http://localhost:5000',
            container: '#frame',
            activeRule: '/vue',
            props: {
                id: 'props 传值方式'
            },

        },
        {
            name: 'ReactMicroApp',
            entry: 'http://localhost:5001/',
            container: '#frame',
            activeRule: '/react'
        },
        {
            name: 'Vue2MicroApp',
            entry: 'http://localhost:5002/',
            container: '#frame',
            activeRule: '/vue2'
        }
    ])
    start({
        prefetch: 'all', // 预加载
        sandbox: {
            experimentalStyleIsolation: true, //   开启沙箱模式,实验性方案,
            // strictStyleIsolation: true
        },
    })
})
</script>

<style scoped lang="scss">
.container {
    display: flex;
    height: 100%;
    width: 100%;

    .nav {
        display: flex;
        flex-direction: column;
        width: 240px;
        font-size: 20px;
        background-color: #333;

        a {
            padding: 8px 12px;
            color: #fff;

            &:hover,
            &.is-active {
                background-color: cadetblue;
            }
        }
    }

    .content {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
    }
}

header {
    line-height: 1.5;
    max-height: 100vh;
}
</style>
```

-   main.ts 文件

```js
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { routes } from './router'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes,
})
const app = createApp(App)

app.use(router)

app.mount('#main')
```

## 接入子应用 Vite+Vue3

由于 qiankun 现版本并不支持 Vite，故引入[vite-plugin-qiankun](https://www.npmjs.com/package/vite-plugin-qiankun)插件,

-   main.ts 文件

```js
import './assets/main.css'
import { createRouter, createWebHistory } from 'vue-router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'
import App from './App.vue'
import { routes } from './routes'

let instance
let router

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
const render = () => {
    // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
    router = createRouter({
        // 运行在主应用中时，添加路由命名空间 /vue
        history: createWebHistory(qiankunWindow.__POWERED_BY_QIANKUN__ ? '/vue' : '/'),
        routes,
    })
    // 挂载应用
    instance = createApp(App)
    instance.use(router)
    instance.mount('#app-vue')
}

const initQianKun = () => {
    renderWithQiankun({
        // bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap
        // 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等
        bootstrap() {
            console.log('bootstrap')
        },
        // 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法，也可以接受主应用传来的参数
        mount(_props) {
            console.log('mount', _props.id)
            render()
        },
        // 应用每次 切出/卸载 会调用的unmount方法，通常在这里我们会卸载微应用的应用实例
        unmount(_props) {
            console.log('unmount', _props)
            instance.unmount()
            instance = null
            router = null
        },
        update(props) {
            console.log(props, 'props')
            console.log('update')
        },
    })
}

// 独立运行时，直接挂载应用
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render()
} else {
    initQianKun()
}
```

-   vite.config.js 文件

```js
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
```

## 接入子应用 Vite+React

-   main.ts 文件

```js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { BrowserRouter } from 'react-router-dom'

let root
const render = () => {
    // 挂载应用
    const BASE_NAME = qiankunWindow.__POWERED_BY_QIANKUN__ ? '/react' : ''
    root = ReactDOM.createRoot(document.getElementById('root'))
    root.render(
        <React.StrictMode>
            <BrowserRouter basename={BASE_NAME}>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    )
}
const initQianKun = () => {
    renderWithQiankun({
        // bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap
        // 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等
        bootstrap() {
            console.log('bootstrap')
        },
        // 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法，也可以接受主应用传来的参数
        mount(_props) {
            console.log('mount', _props)
            render()
        },
        // 应用每次 切出/卸载 会调用的unmount方法，通常在这里我们会卸载微应用的应用实例
        unmount(_props) {
            console.log('unmount', _props)
            root.unmount()
        },
        update(props) {
            console.log(props, 'props')
            console.log('update')
        },
    })
}

// 独立运行时，直接挂载应用
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render()
} else {
    initQianKun()
}
```

-   vite.config.js 文件

在 react 中，需在 vite.config.js 中的 serve 下配置 hmr: false 关闭热更新，否则无法在主应用中加载微应用，虽然 vite-plugin-qiankun 文档中说明 useDevMode = true 时表示不开启热更新，但尝试发现这个选项开启无效。

```js
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(), // qiankun的第一个参数必须与主应用在main.ts中registerMicroApps的name值一致
        qiankun('reactMicroApp', {
            useDevMode: true,
        }),
    ],
    server: {
        host: '0.0.0.0',
        port: 5001,
        // 关闭主机检查，使微应用可以被 fetch
        disableHostCheck: true,
        // 配置跨域请求头，解决开发环境的跨域问题
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        hmr: false,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
```

## 引入 vue-cli + Vue2 子应用

为了能正常加载子应用的静态资源，需要添加public-path.js文件，并在main.js文件中引入

***
webpack中支持运行时publicPath,也就是__webpack_public_path__，而vite不支持运行时publicPath，vite-plugin-qiankun插件处理此问题，故在Vite项目中无需加入。
***

```js
if (window.__POWERED_BY_QIANKUN__) {
  // 动态设置 webpack publicPath，防止资源加载出错
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

-   main.js 文件

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import './public-path'
import App from './App.vue'
import routes from './routes'

Vue.use(VueRouter)
Vue.use(Antd)
Vue.config.productionTip = false

let instance = null
let router = null

/**
 * 渲染函数
 * 两种情况：主应用生命周期钩子中运行 / 微应用单独启动时运行
 */
function render() {
    // 在 render 中创建 VueRouter，可以保证在卸载微应用时，移除 location 事件监听，防止事件污染
    router = new VueRouter({
        // 运行在主应用中时，添加路由命名空间 /vue
        base: window.__POWERED_BY_QIANKUN__ ? '/vue2' : '/',
        mode: 'history',
        routes,
    })

    // 挂载应用
    instance = new Vue({
        router,
        render: (h) => h(App),
    }).$mount('#vue-box')
}

// 独立运行时，直接挂载应用
if (!window.__POWERED_BY_QIANKUN__) {
    render()
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
    console.log('Vue2MicroApp bootstraped')
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
    console.log('Vue2MicroApp mount', props)
    render(props)
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
    console.log('Vue2MicroApp unmount')
    instance.$destroy()
    instance = null
    router = null
}
```

* vue.config.js 文件

```js
const path = require('path')

module.exports = {
    devServer: {
        // 监听端口
        port: 5002,
        // 关闭主机检查，使微应用可以被 fetch
        disableHostCheck: true,
        // 配置跨域请求头，解决开发环境的跨域问题
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        output: {
            // 微应用的包名，这里与主应用中注册的微应用名称一致
            library: 'Vue2MicroApp',
            // 将你的 library 暴露为所有的模块定义下都可运行的方式
            libraryTarget: 'umd',
            // 按需加载相关，设置为 webpackJsonp_Vue2MicroApp 即可
            jsonpFunction: `webpackJsonp_Vue2MicroApp`,
        },
    },
}
```

## 存在问题

由于现阶段 qiankun 对 vite 并不支持，即使引入 vite-plugin-qiankun 插件，仍存在一些问题：

**_1、样式无法隔离_**

即使在住应用中 start 函数中配置了 experimentalStyleIsolation 属性为 true,但是并没有为子应用所有的样式增加后缀标签，为避免样式问题，可以自行通过一些css插件如postcss或者css moudle去解决。

```js
sandbox: {
            experimentalStyleIsolation: true, //   开启沙箱模式,实验性方案,
            // strictStyleIsolation: true
        },
```

**_2、Vite + react 的静态资源无法正常访问_**

在 react 子应用中，项目图片无法正常访问，这估计和 vite 的打包有关系，目前暂时没试过在 react 中改用 webpack 效果如何

使用qiankun接入vite项目的坑还是蛮多的，感兴趣可以一点一点去踩。

## 主应用和子应用通信

主应用和字应用传值有三种方式：
- props
- initGlobalState

具体可参考其他相关文档，此处不展开



