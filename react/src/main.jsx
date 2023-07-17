import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { BrowserRouter } from 'react-router-dom'
import './public-path'

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
