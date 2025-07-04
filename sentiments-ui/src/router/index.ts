import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView }
  ],
})

// ⬇ Add after router is created
router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/signup', '/contact']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  if (authRequired && !token) {
    return next('/login') // 🔒 Redirect to login if not authenticated
  }

  next()
})


export default router
