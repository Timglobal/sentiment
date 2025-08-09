import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import LoginView from '../views/LoginView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import TermsConditionsView from '../views/TermsConditionsView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import FeedbackFormView from '../views/FeedbackFormView.vue'
import ManageWorkersView from '../views/ManageWorkersView.vue'
import AdminPanel from '../views/AdminPanel.vue'
import AdminMomentsView from '@/views/AdminMomentsView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import AdminAnalysisView from '../views/AdminAnalysisView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ProductView from '@/views/ProductView.vue'
// Dashboard views
import Dashboard from '@/views/dashboard/Dashboard.vue'
import SubmitFeedback from '../views/dashboard/SubmitFeedback.vue'
import UploadMoment from '../views/dashboard/UploadMoment.vue'
import ViewMoments from '../views/dashboard/ViewMoments.vue'
import ManageWorkers from '../views/dashboard/ManageWorkers.vue'
import Analytics from '../views/dashboard/Analytics.vue'
import VoiceChat from '../views/dashboard/VoiceChat.vue'

// User Dashboard views
import UserDashboard from '../views/user-dashboard/UserDashboard.vue'
import UserSubmitFeedback from '../views/user-dashboard/SubmitFeedback.vue'
import ManagePatients from '../views/user-dashboard/ManagePatients.vue'
import TaskManagement from '../views/user-dashboard/TaskManagement.vue'
import AIAssistant from '../views/user-dashboard/AIAssistant.vue'
import ManageFeedback from '@/views/dashboard/ManageFeedback.vue'
import AssignPatientsView from '@/views/dashboard/AssignPatientsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { public: true } },
    { path: '/about', name: 'about', component: AboutView, meta: { public: true } },
    { path: '/contact', name: 'contact', component: ContactView, meta: { public: true } },
    { path: '/privacy-policy', name: 'privacy-policy', component: PrivacyPolicyView, meta: { public: true } },
    { path: '/terms-conditions', name: 'terms-conditions', component: TermsConditionsView, meta: { public: true } },
    { path: '/login', name: 'Login', component: LoginView, meta: { public: true } },
    { path: '/signup', name: 'Signup', component: SignupView, meta: { public: true } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { public: true } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordView, meta: { public: true } },
    { path: '/product', name: 'Product', component: ProductView, meta: { public: true } },

    // Legacy form routes (protected)
    { path: '/dashboard-legacy', name: 'DashboardLegacy', component: DashboardView },

    { path: '/feedback', name: 'feedback', component: FeedbackFormView },
    { path: '/manage-workers', name: 'ManageWorkers', component: ManageWorkersView },
    { path: '/admin', name: 'admin', component: AdminPanel },
    { path: '/admin-moments', name: 'AdminMoments', component: AdminMomentsView },
    { path: '/admin-analysis', name: 'AdminAnalysis', component: AdminAnalysisView },

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
      path: '/dashboard/view-moments',
      name: 'DashboardViewMoments',
      component: ViewMoments,
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
    {
      path: '/dashboard/assign-patients',
      name: 'DashboardAssignPatients',
      component: AssignPatientsView,
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
      path: '/user-dashboard/manage-patients',
      name: 'UserDashboardManagePatients',
      component: ManagePatients,
      meta: { layout: 'dashboard', requiresStaff: true }
    },
    {
      path: '/user-dashboard/task-management',
      name: 'UserDashboardTaskManagement',
      component: TaskManagement,
      meta: { layout: 'dashboard', requiresStaff: true }
    },
    {
      path: '/user-dashboard/ai-assistant',
      name: 'UserDashboardAIAssistant',
      component: AIAssistant,
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/my-feedback',
      name: 'UserDashboardMyFeedback',
      component: () => import('../views/user-dashboard/UserDashboard.vue'),
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/analytics',
      name: 'UserDashboardAnalytics',
      component: () => import('../views/user-dashboard/UserDashboard.vue'),
      meta: { layout: 'dashboard' }
    },
    {
      path: '/user-dashboard/settings',
      name: 'UserDashboardSettings',
      component: () => import('../views/user-dashboard/UserDashboard.vue'),
      meta: { layout: 'dashboard' }
    },

    // Catch-all 404 redirect (optional)
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.public) return next()

  if (!token) return next('/login')

  if (to.meta.requiresStaff) {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'staff') return next('/user-dashboard')
  }

  next()
})

export default router
