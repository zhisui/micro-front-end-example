import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import {routes} from './router'
import { createRouter,createWebHistory  } from 'vue-router'

const router = createRouter({
    // mode: 'history',
    history:createWebHistory(),
    routes,
})
const app = createApp(App)

app.use(router)

app.mount('#main')
