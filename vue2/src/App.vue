<template>
  <div>
     <a-menu :selectedKeys="[currentRoute]" mode="horizontal" theme="dark">
      <a-menu-item
        v-for="(item) in menus"
        :key="item.key"
        >
        <router-link :to="item.route">{{item.title}}</router-link>
      </a-menu-item>
     </a-menu>
    <router-view :key="(new Date()).getTime()" />
  </div>
</template>

<script>
export default {
  name: 'App',

  data() {
    return {
      menus: [
        {
          key: "vue",
          route: "/",
          title: "主页"
        },
        {
          key: "vue-list",
          route: "/list",
          title: "列表页"
        }
      ]
    }
  },

  computed: {
    currentRoute() {
      const menu = this.menus.find(item => item.route === this.$route.path)
      return menu ? menu.key : "vue";
    }
  },
}
</script>

<style scoped>
/* a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
} */
</style>
