import {qiankunWindow} from 'vite-plugin-qiankun/dist/helper'

console.log(qiankunWindow.__POWERED_BY_QIANKUN__,'window.__POWERED_BY_QIANKUN__')
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  // 动态设置 webpack publicPath，防止资源加载出错
  //@ts-ignore
  // eslint-disable-next-line no-undef
  window.__webpack_public_path__ = qiankunWindow.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  console.log(qiankunWindow.__webpack_public_path__,'qiankunWindow.__webpack_public_path__')
}
