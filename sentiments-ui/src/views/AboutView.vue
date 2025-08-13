<template>
  <div>
    <!-- Hero Section - Who We Are -->
    <section class="relative py-20 overflow-hidden">
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{
          backgroundImage: `url('/lab.png')`
        }"
      />
      <!-- Overlay -->
      <div class="absolute inset-0 bg-teal-600/80 opacity-15" />

      <div class="container mx-auto px-4 relative z-10">
        <div class="max-w-4xl mx-auto text-center text-white">
          <h1 class="text-4xl lg:text-5xl font-bold mb-6">Who We Are</h1>
          <p class="text-xl leading-relaxed">
            At Timglobal, we are dedicated to bridging the gap between clinical worker and their supervisor. Our
            mission is to empower healthcare professionals with cutting-edge solutions that enhance patient outcomes
            and streamline workflows.
          </p>
        </div>
      </div>
    </section>

    <!-- Our Mission & Vision Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
        </div>

        <div class="max-w-6xl mx-auto space-y-16">
          <!-- Our Mission -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
              <h3 class="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p class="text-lg text-gray-700 leading-relaxed">
                To revolutionize healthcare through the ethical and responsible application of artificial
                intelligence, creating a future where technology seamlessly integrates with human expertise to deliver
                exceptional patient care.
              </p>
            </div>
            <div class="flex justify-center">
              <img
                src="/doctor.png"
                alt="Healthcare professional with tablet"
                class="rounded-full w-[300px] h-[300px] object-cover"
              />
            </div>
          </div>

          <!-- Our Vision -->
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div class="order-2 lg:order-1 flex justify-center">
              <img
                src="/hospital.png"
                alt="Futuristic hospital AI environment"
                class="rounded-lg shadow-lg w-[400px] h-[300px] object-cover"
              />
            </div>
            <div class="order-1 lg:order-2 space-y-6">
              <h3 class="text-2xl font-bold text-gray-900">Our Vision</h3>
              <p class="text-lg text-gray-700 leading-relaxed">
                To be the leading provider of AI-powered healthcare solutions, recognized for our commitment to
                innovation, integrity, and improving the lives of patients and healthcare providers worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Core Values -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          </div>

          <div class="grid md:grid-cols-4 gap-8">
            <div class="text-center space-y-4">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <LightBulbIcon class="w-8 h-8 text-blue-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Innovation</h3>
            </div>

            <div class="text-center space-y-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheckIcon class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Integrity</h3>
            </div>

            <div class="text-center space-y-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <HeartIcon class="w-8 h-8 text-red-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Patient-Centricity</h3>
            </div>

            <div class="text-center space-y-4">
              <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <UsersIcon class="w-8 h-8 text-purple-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Collaboration</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Milestones -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Milestones</h2>
          </div>

          <div class="relative">
            <!-- Timeline Line -->
            <div class="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-300"></div>

            <div class="space-y-12">
              <!-- Company Founded -->
              <div class="relative flex items-center">
                <div class="flex-1 pr-8 text-right">
                  <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                    <div class="flex items-center justify-end space-x-3 mb-2">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon class="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">Company Founded</h3>
                    </div>
                    <p class="text-gray-600">March 2025</p>
                  </div>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div class="flex-1 pl-8"></div>
              </div>

              <!-- First Pilot -->
              <div class="relative flex items-center">
                <div class="flex-1 pr-8"></div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div class="flex-1 pl-8">
                  <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <BoltIcon class="w-4 h-4 text-green-600" />
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">First Pilot</h3>
                    </div>
                    <p class="text-gray-600">2025</p>
                  </div>
                </div>
              </div>

              <!-- Product Launch -->
              <div class="relative flex items-center">
                <div class="flex-1 pr-8 text-right">
                  <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                    <div class="flex items-center justify-end space-x-3 mb-2">
                      <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <ChartBarIcon class="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">Product Launch</h3>
                    </div>
                    <p class="text-gray-600">2025</p>
                  </div>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div class="flex-1 pl-8"></div>
              </div>

              <!-- ISO 27001 Certification -->
              <div class="relative flex items-center">
                <div class="flex-1 pr-8"></div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div class="flex-1 pl-8">
                  <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon class="w-4 h-4 text-yellow-600" />
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">ISO 27001 Certification</h3>
                    </div>
                    <p class="text-gray-600">2026</p>
                  </div>
                </div>
              </div>

              <!-- Scaling Operations -->
              <div class="relative flex items-center">
                <div class="flex-1 pr-8 text-right">
                  <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
                    <div class="flex items-center justify-end space-x-3 mb-2">
                      <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <ArrowTrendingUpIcon class="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 class="text-lg font-semibold text-gray-900">Scaling Operations</h3>
                    </div>
                    <p class="text-gray-600">2026</p>
                  </div>
                </div>
                <div class="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                <div class="flex-1 pl-8"></div>
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
          backgroundImage: `url('/section.png')`
        }"
      />

      <div class="container mx-auto px-4 text-center relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Ready to Transform healthcare environments
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
  LightBulbIcon,
  ShieldCheckIcon,
  HeartIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'
</script>
