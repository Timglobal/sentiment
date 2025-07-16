import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import RoomDetail from '@/views/RoomDetail.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import FeedbackFormView from '../views/FeedbackFormView.vue'
import ManageWorkersView from '../views/ManageWorkersView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import AdminMomentsView from '@/views/AdminMomentsView.vue'
import CreateRoom from '@/views/CreateRoom.vue'
import RoomList from '../views/RoomList.vue'
import AssignOccupant from '@/views/AssignOccupant.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/feedback', name: 'feedback', component: FeedbackFormView },
    { path: '/manage-workers', name: 'ManageWorkers', component: ManageWorkersView },
    { path: '/admin', name: 'admin', component: AdminPanel },
    { path: '/create-room', name: 'CreateRoom', component: CreateRoom },
    { path: '/admin-moments', name: 'AdminMoments', component: AdminMomentsView},
    { path: '/admin-analysis', name: 'AdminAnlysis', component: () => import('../views/AdminAnalysisView.vue'), meta: { requiresAuth: true}},
    { path: '/reset-password', name: 'ResetPassword', component: () => import('@/views/ResetPasswordView.vue'),},
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPasswordView.vue'),},
    { path: '/product', name: 'Product', component: () => import('@/views/ProductView.vue'),},
    { path: '/rooms', name: 'RoomList', component: RoomList },
    { path: '/rooms/:id/assign', name: 'AssignOccupant', component: AssignOccupant},
    { path: '/rooms/:id', name: 'RoomDetail', component: RoomDetail },
    { path: '/tenants', name: 'TenantList', component: () => import('@/views/TenantList.vue')},
    { path: '/extend/:roomId', name: 'ExtendDecision', component: () => import('@/views/ExtendDecision.vue')},
    { path: '/request-demo', name: 'Waitlist', component: () => import('@/views/Waitlist.vue')}
  ],
})

// ⬇ Add after router is created
router.beforeEach((to, from, next) => {
  const publicPages = ['/','/about','/product', '/login', '/signup', '/contact', '/request-demo']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  if (authRequired && !token) {
    return next('/login') // 🔒 Redirect to login if not authenticated
  }

  next()
})


export default router
