import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import GoalsView from '../views/GoalsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/auth', component: AuthView },
    { path: '/', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/goals', component: GoalsView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return '/auth'
  if (to.path === '/auth' && token) return '/'
})

export default router
