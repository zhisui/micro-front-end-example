<template>
    <div class="container">
        <div class="nav">
            <RouterLink :to="item.path" v-for="(item, index) in navList" :key="index" active-class="is-active">{{ item.name
            }}</RouterLink>
        </div>
        <!-- 主应用渲染区，用于挂载主应用路由触发的组件 -->
        <div class="content" v-show="routeName">
            <RouterView />
        </div>
        <!-- 子应用渲染区，用于挂载子应用节点 -->
        <div class="content" id="frame" v-show="!routeName">
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
            activeRule: '/vue'
        },
        {
            name: 'ReactMicroApp',
            entry: 'http://localhost:5001/',
            container: '#frame',
            activeRule: '/react'
        }
    ])
    start({
        prefetch: 'all', // 预加载
        sandbox: {
            experimentalStyleIsolation: true, //   开启沙箱模式,实验性方案
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
