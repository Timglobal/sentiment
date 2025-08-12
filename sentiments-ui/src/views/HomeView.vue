<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-8">
            <div class="space-y-4">
              <span class="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Innovation & Technology
              </span>
              <h1 class="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Empowering Innovation Through <span class="text-blue-600">Expert Orchestration</span>
              </h1>
              <p class="text-xl text-gray-600 leading-relaxed">
                Transform your business with cutting-edge solutions and expert guidance. We orchestrate innovation to
                drive your success in the digital age.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-4">
<<<<<<< HEAD
              <router-link to="/signup" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center transition-colors">
                Get Started
                <ArrowRightIcon class="ml-2 h-4 w-4" />
              </router-link>
              <a href="https://youtu.be/7GD_WBZLRP0" class="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center justify-center transition-colors">
                <PlayIcon class="mr-2 h-4 w-4" />
                Watch Demo
              </a>
=======
              <router-link to="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center transition-colors">
                Get Started 
                <ArrowRightIcon class="ml-2 h-4 w-4" />
              </router-link>
              <button class="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center justify-center transition-colors">
                <PlayIcon class="mr-2 h-4 w-4" />
                Watch Demo
              </button>
>>>>>>> 390c0fc38dbc35d4b041da797ff1f473a135265a
            </div>
          </div>
          <div class="relative">
            <div class="relative z-10">
              <img
                src="/heroimage.svg"
                alt="Timglobal Healthcare Innovation Dashboard"
                class="rounded-2xl w-full"
              />
            </div>
            <div class="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full opacity-20"></div>
            <div class="absolute -bottom-4 -left-4 w-48 h-48 bg-purple-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Capabilities Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Core <span class="text-blue-600">Capabilities</span>
          </h2>
          <p class="text-lg text-gray-600 max-w-4xl mx-auto">
            We delivers measurable improvements across critical healthcare operations, backed by extensive research
            and real-world implementation.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="bg-white border border-gray-200 hover:shadow-lg transition-shadow p-8 text-center rounded-lg">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CogIcon class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Workflow Optimization</h3>
            <p class="text-gray-600 leading-relaxed">
              Automation that reduces manual task by up to 70% while improving accuracy and patient outcomes
            </p>
          </div>

          <div class="bg-white border border-gray-200 hover:shadow-lg transition-shadow p-8 text-center rounded-lg">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Resource Allocation</h3>
            <p class="text-gray-600 leading-relaxed">
              Intelligent resource management using predictive analytics to optimize staff scheduling and equipment
              utilization
            </p>
          </div>

          <div class="bg-white border border-gray-200 hover:shadow-lg transition-shadow p-8 text-center rounded-lg">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">Risk Mitigation</h3>
            <p class="text-gray-600 leading-relaxed">
              Advanced risk assessment algorithms that identify potential issue before they impact patient care or
              operations
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Healthcare Providers Trust Timglobal Section -->
    <section class="py-20 bg-blue-50">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Why Healthcare Providers Trust Timglobal
            </h2>
            <p class="text-lg text-gray-700 leading-relaxed">
              We provide AI-powered platform that streamlines workflows, optimizes resource allocation and mitigates
              operational risks. Backed by cutting-edge research through UK Degrees ltd., our solution offers
              real-time analysis for deep stakeholder insight enabling better descision, improved outcomes and,
              on-time, on-budget delivery. Our scalable SaaS model is built specifically for NHS trusts, private
              providers and care organizations, empowering them to focus on what matters the most: patient care.
            </p>
            <div class="pt-4">
              <a
                href="#"
                class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-lg group"
              >
                Learn more
                <ArrowRightIcon class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
          <div class="relative">
            <div class="relative z-10">
              <img
                src="/doctor_patient.png"
                alt="Healthcare provider consulting with elderly patient in modern medical office"
                class="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our <span class="text-blue-600">Services</span>
          </h2>
          <p class="text-lg text-gray-600 max-w-4xl mx-auto">
            Comprehensive healthcare technology solutions designed to transform operations, improve patient outcomes,
            and drive innovation across your organization.
          </p>
        </div>

        <div class="max-w-6xl mx-auto space-y-6">
          <!-- First Row - 3 Cards -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Sentiment Analysis -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-blue-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <ClockIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Sentiment Analysis</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Analysis of patient feedback and staff communications to improve satisfaction scores
                </p>
                <a href="#" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group">
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <!-- Telemarketing -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-green-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <PhoneIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Telemarketing</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Streamlined project workflows with intelligent task allocation and progress tracking
                </p>
                <a
                  href="#"
                  class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
                >
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <!-- Healthcare Surveillance -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-blue-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <ChartBarIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Healthcare Surveillance</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Real-time monitoring systems for early detection of health trends and outbreak prevention
                </p>
                <a href="#" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group">
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          <!-- Second Row - 3 Cards -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Project Management -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-green-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <ClipboardDocumentListIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Project Management</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Streamlined project workflows with intelligent task allocation and progress tracking
                </p>
                <a
                  href="#"
                  class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
                >
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <!-- Healthcare Consulting -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-blue-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <UserGroupIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Healthcare Consulting</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Expert guidance on digital transformation and technology implementation strategies
                </p>
                <a href="#" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group">
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <!-- Research & Collaboration -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-green-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <BookOpenIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Research & Collaboration</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Partnership opportunities with academic institutions for cutting-edge healthcare innovation
                </p>
                <a
                  href="#"
                  class="inline-flex items-center text-green-600 hover:text-green-700 font-medium group"
                >
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          <!-- Third Row - 1 Card -->
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Training and Support -->
            <div class="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <div class="bg-blue-600 p-6 text-white">
                <div class="w-12 h-12 mb-4">
                  <AcademicCapIcon class="w-12 h-12" />
                </div>
                <h3 class="text-xl font-semibold">Training and Support</h3>
              </div>
              <div class="bg-white p-6">
                <p class="text-gray-700 mb-6 leading-relaxed">
                  Comprehensive training programs and ongoing technical support for healthcare teams
                </p>
                <a href="#" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group">
                  Learn more
                  <ArrowRightIcon class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- More Services Loading -->
        <div class="text-center mt-12">
          <div class="inline-flex items-center text-gray-500">
            <div class="flex space-x-1 mr-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <span class="text-sm">More Services Loading...</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile App Section -->
    <section class="py-20 bg-blue-50">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div class="space-y-6">
              <h2 class="text-4xl lg:text-5xl font-bold text-gray-900">
                Mobile App <span class="text-blue-600">Coming Soon</span>
              </h2>
              <p class="text-lg text-gray-700 leading-relaxed">
                Take healthcare management on-the-go with our upcoming mobile application. Get real-time alerts,
                access dashboards, and manage operations from anywhere.
              </p>
            </div>

            <!-- Features List -->
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BellIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Real-time Notifications</h3>
                  <p class="text-gray-600">Instant alerts for critical system events</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Mobile Dashboard</h3>
                  <p class="text-gray-600">Access key metrics and analytics anywhere</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarIcon class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">Schedule Management</h3>
                  <p class="text-gray-600">Manage staff schedules and appointments</p>
                </div>
              </div>
            </div>

            <!-- Waitlist Card -->
            <div class="bg-white rounded-2xl p-8 shadow-lg">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">Join the Waitlist</h3>
              <p class="text-gray-600 mb-6 leading-relaxed">
                Be the first to know when our mobile app launches. Get early access and exclusive features.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <input
                  v-model="waitlistEmail"
                  type="email"
                  placeholder="Enter your email address"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <router-link
                  to="/request-demo"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors text-center"
                >
                  Join Waitlist
                </router-link>
              </div>
              <p class="text-sm text-gray-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>

          <!-- Mobile Phone Mockup -->
          <div class="relative flex justify-center">
            <div class="relative">
              <!-- Phone Frame -->
              <div class="w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <!-- Phone Screen -->
                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <!-- Phone Icon -->
                  <div class="w-20 h-20 border-4 border-white rounded-2xl flex items-center justify-center mb-8">
                    <PhoneIcon class="w-10 h-10" />
                  </div>

                  <!-- Coming Soon Text -->
                  <h3 class="text-3xl font-bold mb-2">Coming Soon</h3>
                  <p class="text-blue-100 text-center px-8 mb-8">
                    Healthcare Management
                    <br />
                    On-the-Go
                  </p>

                  <!-- Page Indicators -->
                  <div class="flex space-x-2">
                    <div class="w-3 h-3 bg-white rounded-full"></div>
                    <div class="w-3 h-3 bg-white/50 rounded-full"></div>
                    <div class="w-3 h-3 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">Frequently Asked Questions</h2>

          <div class="space-y-4">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="border border-gray-200 rounded-lg"
            >
              <button
                @click="toggleFaq(index)"
                class="w-full text-left px-6 py-6 flex justify-between items-center focus:outline-none"
              >
                <span class="text-lg font-semibold text-gray-900">{{ faq.question }}</span>
                <ChevronDownIcon
                  :class="['w-5 h-5 text-gray-500 transition-transform', { 'rotate-180': faq.isOpen }]"
                />
              </button>
              <div v-show="faq.isOpen" class="px-6 pb-6 text-gray-600">
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Information Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <!-- Left Side - Contact Information -->
          <div class="space-y-8">
            <div class="space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900">Contact information</h2>
              <p class="text-lg text-gray-600 leading-relaxed">
                Have a question? Reach out through one of the options below and our team member will be in touch soon
              </p>
            </div>

            <div class="space-y-8">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Chat us</h3>
                <a href="mailto:info@timglobal.uk" class="text-lg text-gray-700 hover:text-blue-600">
                  info@timglobal.uk
                </a>
              </div>

              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-3">Call us</h3>
                <a href="tel:+447352310353" class="text-lg text-gray-700 hover:text-blue-600">
                  +447352310353
                </a>
              </div>
            </div>
          </div>

          <!-- Right Side - Contact Form -->
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-900 mb-2">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="What is your Full Name?"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
                  Email Address <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="What is your email address?"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  v-model="form.message"
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Share your thoughts"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg transition-colors"
              >
                Send Message
              </button>
              <p class="text-sm text-gray-500 text-center">Our team will reach out soon with the next steps.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toast-notification'
const toast = useToast()
import {
  ArrowRightIcon,
  PlayIcon,
  CogIcon,
  UsersIcon,
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BellIcon,
  CalendarIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

// Reactive data
const waitlistEmail = ref('')
const form = ref({
  name: '',
  email: '',
  message: ''
})

const faqs = ref([
  {
    question: 'What is Timglobal Ltd?',
    answer: 'Timglobal Ltd is a healthcare technology company that provides AI-powered solutions for healthcare providers. We specialize in workflow optimization, resource allocation, and risk mitigation through cutting-edge technology and expert orchestration. Our platform is designed specifically for NHS trusts, private healthcare providers, and care organizations to improve operational efficiency and patient outcomes.',
    isOpen: false
  },
  {
    question: 'How does the AI-powered project orchestration work?',
    answer: 'Our AI-powered project orchestration uses advanced algorithms and machine learning to analyze healthcare workflows, predict resource needs, and automatically optimize task allocation. The system continuously learns from operational data to improve efficiency, reduce manual tasks by up to 70%, and provide real-time insights for better decision-making. It integrates seamlessly with existing healthcare systems and provides predictive analytics for proactive management.',
    isOpen: false
  },
  {
    question: 'What are the benefits of using Timglobal Ltd?',
    answer: 'Key benefits include: improved operational efficiency with up to 70% reduction in manual tasks, enhanced patient outcomes through optimized workflows, better resource allocation using predictive analytics, real-time monitoring and risk mitigation, seamless integration with existing systems, and comprehensive support and training. Our scalable SaaS model ensures cost-effective implementation while providing measurable improvements in healthcare delivery and operational performance.',
    isOpen: false
  }
])

// Methods
const toggleFaq = (index: number) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}

/*const submitForm = () => {
  // Handle form submission
  console.log('Form submitted:', form.value)
  // Reset form
  form.value = { name: '', email: '', message: '' }
  alert('Thank you for your message! We will get back to you soon.')
}*/
async function submitForm() {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        message: form.value.message,
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Message sent! ✅')
    form.value = {name : '', email: '', message: ''}

  } catch (err: any) {
    toast.error('Failed to send message: ' + err.message)
  }
}
</script>
