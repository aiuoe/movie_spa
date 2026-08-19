import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Inicio' }
    },
    {
      path: '/watch/:id',
      name: 'player',
      component: () => import('@/views/PlayerView.vue'),
      meta: { title: 'Reproduciendo', fullscreen: true }
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryView.vue'),
      meta: { title: 'Mi biblioteca' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'Buscar' }
    },
    {
      path: '/live',
      name: 'live',
      component: () => import('@/views/LiveTVView.vue'),
      meta: { title: 'TV en vivo' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'Perfil' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'movie_spa'} · movie_spa`
})

export default router