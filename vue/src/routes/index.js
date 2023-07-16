export const routes = [
  {
    path: '/vue-home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/vue-about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound.vue'),
  },
]
