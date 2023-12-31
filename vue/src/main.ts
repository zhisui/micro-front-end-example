import './assets/main.css'
import { createRouter, createWebHistory } from 'vue-router'
import {
  renderWithQiankun,
  qiankunWindow,
} from 'vite-plugin-qiankun/dist/helper'
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
