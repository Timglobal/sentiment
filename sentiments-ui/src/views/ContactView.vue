<template>
  <div>
    <!-- Main Content -->
    <main class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <!-- Hero Section -->
          <div class="text-center mb-16">
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Let's Build the Future of Healthcare Together
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed">
              We're excited to learn more about your needs and how Tim Global Technologies Ltd. can help. Please fill
              out the form below, and we'll get back to you promptly.
            </p>
          </div>

          <!-- Contact Form -->
          <form @submit.prevent="submitForm" class="space-y-6 mb-16">
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
              <label for="company" class="block text-sm font-medium text-gray-900 mb-2">
                Company
              </label>
              <input
                v-model="form.company"
                type="text"
                id="company"
                name="company"
                placeholder="What is your company name?"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                v-model="form.phone"
                type="tel"
                id="phone"
                name="phone"
                placeholder="What is your phone number?"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="Tell us about your project or requirements"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div class="space-y-4">
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg transition-colors font-medium"
              >
                Send Message
              </button>
              <p class="text-sm text-gray-500 text-center">Our team will reach out soon with the next steps.</p>
            </div>
          </form>

          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact information</h2>
              <p class="text-gray-600 mb-8">
                Have a question? Reach out through one of the options below and our team member will be in touch soon
              </p>
            </div>

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Chat us</h3>
                <a href="mailto:info@timglobal.uk" class="text-gray-700 hover:text-blue-600 transition-colors">
                  info@timglobal.uk
                </a>
              </div>

              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Call us</h3>
                <a href="tel:+447352310353" class="text-gray-700 hover:text-blue-600 transition-colors">
                  +447352310353
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- CTA Section -->
    <section class="py-20 relative overflow-hidden">
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{
          backgroundImage: `url('/section.png')`
        }"
      />

      <!-- Optional overlay for better text readability -->
      <div class="absolute inset-0 bg-blue-600/10" />

      <div class="container mx-auto px-4 text-center relative z-10">
        <div class="max-w-3xl mx-auto space-y-8">
          <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">
            Ready To Transform Healthcare Environments
          </h2>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/request-demo" class="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Request a Demo
            </router-link>
            <button class="border border-white text-white hover:bg-white hover:text-blue-600 bg-transparent px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Get in Touch
            </button>
          </div>
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

const name = ref('')
const email = ref('')
const message = ref('')
const form = ref({
  name: '',
  email: '',
  company: '',
  phone: '',
  message: ''
})

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
        company: form.value.company,
        phone: form.value.phone,
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Message sent! ✅')
    form.value = {name : '', email: '', company: '', phone: '', message: ''}

  } catch (err: any) {
    toast.error('Failed to send message: ' + err.message)
  }
}
</script>