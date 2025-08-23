<template>
  <div>
    <!-- Main Content -->
    <main class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
          <!-- Hero Section -->
          <div class="text-center mb-16">
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Join Our Team at Timglobal
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed">
              We’re always looking for talented people to grow with us.
              Apply below and take the next step in your career!
            </p>
          </div>

          <!-- Careers Form -->
          <form @submit.prevent="submitApplication" class="space-y-6 mb-16">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-900 mb-2">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                placeholder="Enter your full name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                id="email"
                placeholder="Enter your email address"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <!-- WhatsApp -->
            <div>
              <label for="whatsapp" class="block text-sm font-medium text-gray-900 mb-2">
                WhatsApp Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.whatsapp"
                type="tel"
                id="whatsapp"
                placeholder="Include country code (e.g. +447352310353)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <!-- Role -->
            <div>
              <label for="role" class="block text-sm font-medium text-gray-900 mb-2">
                Role <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.role"
                type="text"
                id="role"
                placeholder="e.g. Software Engineer"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <!-- Level -->
            <div>
              <label for="level" class="block text-sm font-medium text-gray-900 mb-2">
                Level <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.level"
                id="level"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>Select your level</option>
                <option>Intern</option>
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>

            <!-- Cover Letter -->
            <div>
              <label for="coverletter" class="block text-sm font-medium text-gray-900 mb-2">
                Cover Letter <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.coverletter"
                id="coverletter"
                rows="4"
                placeholder="Tell us why you’re a great fit..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>

            <!-- CV Upload -->
            <div>
              <label for="cv" class="block text-sm font-medium text-gray-900 mb-2">
                Upload CV <span class="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="cv"
                @change="handleFileUpload"
                accept=".pdf,.doc,.docx"
                class="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer
                       focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
                required
              />
              <p class="text-xs text-gray-500 mt-2">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
            </div>

            <!-- Submit Button -->
            <div class="space-y-4">
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg transition-colors font-medium"
                :disabled="loading"
              >
                {{ loading ? "Submitting..." : "Apply Now" }}
              </button>
              <p v-if="success" class="text-green-600 text-center">✅ Application submitted successfully!</p>
              <p v-if="error" class="text-red-600 text-center">❌ {{ error }}</p>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { API_BASE_URL } from '@/config'

const form = ref({
  name: "",
  email: "",
  whatsapp: "",
  role: "",
  level: "",
  coverletter: "",
  cv: null,
});

const loading = ref(false);
const success = ref(false);
const error = ref("");

const handleFileUpload = (e) => {
  form.value.cv = e.target.files[0];
};

const submitApplication = async () => {
  loading.value = true;
  success.value = false;
  error.value = "";

  try {
    const formData = new FormData();
    Object.keys(form.value).forEach((key) => {
      formData.append(key, form.value[key]);
    });

    const res = await fetch(`${API_BASE_URL}/careers`, {
      method: "POST",
      body: formData, // fetch auto sets correct headers for FormData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Something went wrong");
    }

    success.value = true;
    form.value = { name: "", email: "", whatsapp: "", role: "", level: "", coverletter: "", cv: null };
  } catch (err) {
    error.value = err.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>
