<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center space-y-8">
          <div class="space-y-6">
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Transform Your <span class="text-blue-600">Workforce Management</span>
              <br />
              With AI-Powered Insights
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Timglobal's staff sentiment analysis platform empowers organizations to understand, engage, and optimize
              their workforce through intelligent feedback analysis and comprehensive management tools
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Get Started
            </router-link>
            <router-link to="/about" class="border border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Learn More
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Workforce Analytics
            </h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides real-time insights into staff sentiment, engagement, and performance metrics to
              help you make data-driven decisions
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Spotlight -->
            <div class="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
              <div class="space-y-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">Spotlight</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Track Staff Sentiment in real-time with advanced AI-powered analysis
                  </p>
                </div>
              </div>
            </div>

            <!-- Staff Management -->
            <div class="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
              <div class="space-y-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">Staff Management</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Comprehensive tools for managing workforce feedback and development
                  </p>
                </div>
              </div>
            </div>

            <!-- Project Management -->
            <div class="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
              <div class="space-y-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">Project Management</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Streamlined project workflows with intelligent task allocation and progress tracking
                  </p>
                </div>
              </div>
            </div>

            <!-- Telemarketing -->
            <div class="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow p-6 rounded-lg">
              <div class="space-y-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-3">Telemarketing</h3>
                  <p class="text-gray-600 leading-relaxed">
                    Enterprise-grade security with complete data privacy protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted by Leading Organizations -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Trusted by Leading Organizations</h2>
            <p class="text-lg text-gray-600">Join thousands of companies improving their workforce management</p>
          </div>

          <!-- Statistics with Progress Bars -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div class="grid md:grid-cols-4 gap-12 text-center">
              <div class="space-y-4">
                <div class="flex justify-center">
                  <div class="w-16 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <div class="text-gray-900 font-medium text-lg">Companies</div>
              </div>
              <div class="space-y-4">
                <div class="flex justify-center">
                  <div class="w-16 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <div class="text-gray-900 font-medium text-lg">Employees</div>
              </div>
              <div class="space-y-4">
                <div class="flex justify-center">
                  <div class="w-16 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <div class="text-gray-900 font-medium text-lg">Feedback Analyzed</div>
              </div>
              <div class="space-y-4">
                <div class="flex justify-center">
                  <div class="w-16 h-1 bg-blue-600 rounded-full"></div>
                </div>
                <div class="text-gray-900 font-medium text-lg">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 relative overflow-hidden">
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%201487627369-CfehLW6ImtrOZdzh1Xi5IIZZwkOq9k.png')`
        }"
      />

      <div class="container mx-auto px-4 text-center relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Ready To Transform Healthcare Environments
          </h2>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/request-demo" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Request a Demo
            </router-link>
            <router-link to="/contact" class="border border-white text-white hover:bg-white hover:text-blue-600 bg-transparent px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Get in Touch
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
</script>

