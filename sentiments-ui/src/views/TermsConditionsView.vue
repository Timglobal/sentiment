<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-20 bg-gradient-to-br from-purple-50 to-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Terms & Conditions
          </h1>
          <p class="text-lg text-gray-600 leading-relaxed">
            The terms governing your use of our healthcare monitoring and analytics system.
          </p>
          <p class="text-sm text-gray-500 mt-4">
            Last updated: {{ new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto space-y-12">

          <!-- Introduction -->
          <section class="prose prose-lg max-w-none">
            <div class="bg-purple-50 p-6 rounded-lg mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p class="text-gray-700 mb-4">
                These Terms & Conditions ("Terms") govern your use of <strong>Timglobal Limited's</strong> healthcare monitoring and analytics system.
                By using our system, you agree to comply with these Terms.
              </p>
              <div class="bg-purple-100 border-l-4 border-purple-500 p-4 mt-4">
                <p class="text-purple-800 font-medium mb-2">User Consent Notice:</p>
                <p class="text-purple-700 text-sm leading-relaxed">
                  <strong>By logging into this platform, you explicitly consent to:</strong> (1) Your data being processed for sentiment analysis and quality assurance purposes by your healthcare organisation, (2) The collection and analysis of your interactions within the system for performance monitoring and improvement, and (3) The terms outlined in our Privacy Policy regarding data handling and retention.
                </p>
              </div>
            </div>
          </section>

          <!-- Definitions -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">2. Definitions</h2>
            <div class="grid md:grid-cols-3 gap-6">
              <div class="bg-blue-50 p-6 rounded-lg">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Staff</h3>
                <p class="text-sm text-gray-600">Employees, contractors, or agents working in healthcare facilities</p>
              </div>

              <div class="bg-green-50 p-6 rounded-lg">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Patient</h3>
                <p class="text-sm text-gray-600">Individuals receiving care or treatment in healthcare facilities</p>
              </div>

              <div class="bg-purple-50 p-6 rounded-lg">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Admin</h3>
                <p class="text-sm text-gray-600">Authorised personnel managing system access and configurations</p>
              </div>
            </div>
          </section>

          <!-- User Responsibilities -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">3. User Responsibilities</h2>
            <div class="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
              <p class="text-gray-700 mb-4 font-semibold">As a user of our system, you must:</p>
              <div class="space-y-3">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Provide accurate information</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Not bypass monitoring systems</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Use the system only for its intended healthcare purposes</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Administration Responsibilities -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">4. Administration Responsibilities</h2>
            <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <div class="flex items-start">
                <svg class="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="text-lg font-semibold text-red-800 mb-3">Healthcare Organisation Legal Obligations</h3>
                  <p class="text-red-700 mb-4">
                    Each healthcare organisation using this platform must ensure compliance with all applicable data protection laws.
                  </p>
                  <div class="space-y-3 text-red-700">
                    <div class="flex items-start">
                      <svg class="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span>Obtain proper informed consent from all users before platform registration</span>
                    </div>
                    <div class="flex items-start">
                      <svg class="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span>Ensure users understand data collection purposes before uploading any content</span>
                    </div>
                    <div class="flex items-start">
                      <svg class="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span>Comply with UK GDPR and all applicable healthcare data protection regulations</span>
                    </div>
                  </div>
                  <div class="bg-red-100 p-4 rounded-md mt-4">
                    <p class="font-semibold text-red-800 mb-2">Timglobal Limitation of Liability:</p>
                    <p class="text-sm text-red-700 leading-relaxed">
                      Timglobal Limited disclaims responsibility for any violations of data protection laws,
                      privacy breaches, or unauthorised data processing resulting from the healthcare organisation's
                      failure to comply with these responsibilities. The organisation bears sole liability for
                      ensuring proper consent and legal compliance before using this platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Monitoring & Recording -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">5. Monitoring & Recording</h2>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <div class="flex items-start">
                <svg class="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2">Important Notice</h3>
                  <p class="text-gray-700 mb-3">
                    You acknowledge that our system may record video, audio, and activity data for healthcare monitoring and improvement purposes.
                  </p>
                  <p class="text-gray-700">
                    Recordings may be reviewed for performance evaluation, safety assessment, training purposes, and regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Prohibited Uses -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">6. Prohibited Uses</h2>
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <div class="flex items-start mb-4">
                <svg class="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <h3 class="font-semibold text-gray-900">You must NOT:</h3>
              </div>
              <div class="space-y-3 ml-9">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Use the system for personal surveillance unrelated to healthcare</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Share recordings without proper authorisation</span>
                </div>
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Modify, copy, or reverse engineer the software</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Intellectual Property -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
            <div class="bg-blue-50 p-6 rounded-lg">
              <div class="flex items-center">
                <svg class="w-8 h-8 text-blue-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <p class="text-gray-700">
                  All intellectual property rights in the system, including software, designs, and content, belong to
                  <strong>Timglobal Limited</strong> or its licensors.
                </p>
              </div>
            </div>
          </section>

          <!-- Limitation of Liability -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <div class="bg-gray-50 p-6 rounded-lg">
              <p class="text-gray-700 mb-4 font-semibold">Timglobal Limited is not responsible for:</p>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-700">Losses arising from misuse of the system</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-700">Unauthorised access caused by user negligence</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Changes to Terms -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">9. Changes to the Terms</h2>
            <div class="bg-purple-50 p-6 rounded-lg">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <p class="text-gray-700">
                  We may update these Terms from time to time. Your continued use of the system constitutes acceptance of any changes.
                </p>
              </div>
            </div>
          </section>

          <!-- Governing Law -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">10. Governing Law</h2>
            <div class="bg-green-50 p-6 rounded-lg">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                </svg>
                <p class="text-gray-700">
                  These Terms are governed by the <strong>Laws of England & Wales</strong>.
                </p>
              </div>
            </div>
          </section>

          <!-- Contact Information -->
          <section>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">10. Contact Information</h2>
            <div class="bg-blue-50 p-6 rounded-lg">
              <p class="text-gray-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div class="space-y-2 text-gray-700">
                <p><strong>Company:</strong> Timglobal Limited</p>
                <p><strong>Email:</strong> info@timglobal.co.uk</p>
                <p><strong>Address:</strong> United Kingdom</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>

    <!-- Acceptance Notice -->
    <section class="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <div class="bg-white p-8 rounded-xl shadow-sm">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p class="text-gray-600 mb-6">
              By using our healthcare monitoring system, you acknowledge that you have read, understood,
              and agree to be bound by these Terms & Conditions.
            </p>
            <router-link to="/privacy-policy"
                         class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              Read our Privacy Policy
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// No specific script needed for this static page
</script>

<style scoped>
/* Custom styles if needed */
</style>
