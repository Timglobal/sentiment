import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
// import RoomDetail from '../views/RoomDetail.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import FeedbackFormView from '../views/FeedbackFormView.vue'
import ManageWorkersView from '../views/ManageWorkersView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import AdminMomentsView from '@/views/AdminMomentsView.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'

// Dashboard views
import Dashboard from '@/views/dashboard/Dashboard.vue'
import SubmitFeedback from '../views/dashboard/SubmitFeedback.vue'
import UploadMoment from '../views/dashboard/UploadMoment.vue'
import ManageWorkers from '../views/dashboard/ManageWorkers.vue'
import Analytics from '../views/dashboard/Analytics.vue'
import VoiceChat from '../views/dashboard/VoiceChat.vue'

// User Dashboard views
import UserDashboard from '../views/user-dashboard/UserDashboard.vue'
import UserSubmitFeedback from '../views/user-dashboard/SubmitFeedback.vue'
import ManageFeedback from '@/views/dashboard/ManageFeedback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/contact', name: 'contact', component: ContactView },
    // { path: '/login', name: 'Login', component: LoginView },
    // { path: '/signup', name: 'signup', component: SignupView },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/feedback', name: 'feedback', component: FeedbackFormView },
    { path: '/manage-workers', name: 'ManageWorkers', component: ManageWorkersView },
    { path: '/admin', name: 'admin', component: AdminPanel },
    // { path: '/create-room', name: 'CreateRoom', component: CreateRoom },
    { path: '/admin-moments', name: 'AdminMoments', component: AdminMomentsView},
    { path: '/admin-analysis', name: 'AdminAnlysis', component: () => import('../views/AdminAnalysisView.vue'), meta: { requiresAuth: true}},
    { path: '/reset-password', name: 'ResetPassword', component: () => import('@/views/ResetPasswordView.vue'),},
    { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPasswordView.vue'),},
    { path: '/product', name: 'Product', component: () => import('@/views/ProductView.vue'),},
  {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    // Dashboard routes
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/submit-feedback',
      name: 'DashboardSubmitFeedback',
      component: SubmitFeedback,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/upload-moment',
      name: 'DashboardUploadMoment',
      component: UploadMoment,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/manage-workers',
      name: 'DashboardManageWorkers',
      component: ManageWorkers,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/analytics',
      name: 'DashboardAnalytics',
      component: Analytics,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/voice-chat',
      name: 'DashboardVoiceChat',
      component: VoiceChat,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/dashboard/managefeedbacks',
      name: 'DashboardManageFeedbacks',
      component: ManageFeedback,
      meta: { layout: 'dashboard' }
    },
    // User Dashboard routes
    {
      path: '/user-dashboard',
      name: 'UserDashboard',
      component: UserDashboard,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/submit-feedback',
      name: 'UserDashboardSubmitFeedback',
      component: UserSubmitFeedback,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/my-feedback',
      name: 'UserDashboardMyFeedback',
      component: () => import('../views/user-dashboard/UserDashboard.vue'), // Placeholder
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/analytics',
      name: 'UserDashboardAnalytics',
      component: () => import('../views/user-dashboard/UserDashboard.vue'), // Placeholder
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/settings',
      name: 'UserDashboardSettings',
      component: () => import('../views/user-dashboard/UserDashboard.vue'), // Placeholder
      meta: { layout: 'dashboard' }
    }
  ],
})

// ⬇ Add after router is created
router.beforeEach((to, from, next) => {
  const publicPages = ['/','/about','/product', '/login', '/signup', '/contact', '/request-demo', '/forgot-password', '/reset-password']
  const authRequired = !publicPages.includes(to.path)
  const token = localStorage.getItem('token')

  if (authRequired && !token) {
    return next('/login') // 🔒 Redirect to login if not authenticated
  }

  next()
})


export default router
