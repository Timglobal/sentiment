
<!-- src/views/ContactView.vue -->
<template>
  
    <div class="max-w-6xl mx-auto">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <div>
          <h2 style="font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 1rem; line-height: 1.3;">Let's Build the Future of Healthcare Together</h2>
          <p style="font-size: 1rem; font-weight: 400; color: #6B7280; line-height: 1.7; margin-bottom: 2rem;">We're excited to learn more about your needs and how Tim Global Technologies Ltd. can help. Please fill out the form below, and we'll get back to you promptly.</p>
          
          <form @submit.prevent="submitForm" style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: auto;">
  
            <!-- Name -->
            <div style="margin-bottom: 1.25rem;">
                <label for="name" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Name</label>
                <input 
                v-model="name"
                id="name"
                type="text"
                placeholder="What is your full name"
                required
                style="margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; outline: none; transition: 0.2s ease; color: #111827;"
                onfocus="this.style.borderColor='#10B981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.3)';"
                onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"
                >
            </div>

            <!-- Email -->
            <div style="margin-bottom: 1.25rem;">
                <label for="email" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Email Address</label>
                <input 
                v-model="email"
                id="email"
                type="email"
                placeholder="What is your email address?"
                required
                style="margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; outline: none; transition: 0.2s ease; color: #111827;"
                onfocus="this.style.borderColor='#10B981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.3)';"
                onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"
                >
            </div>

            <!-- Message -->
            <div style="margin-bottom: 1.25rem;">
                <label for="message" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Message</label>
                <textarea 
                v-model="message"
                id="message"
                rows="4"
                placeholder="Share your thoughts"
                required
                style="margin-top: 0.25rem; display: block; width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; outline: none; transition: 0.2s ease; color: #111827;"
                onfocus="this.style.borderColor='#10B981'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,0.3)';"
                onblur="this.style.borderColor='#E5E7EB'; this.style.boxShadow='none';"
                ></textarea>
            </div>

            <!-- Button -->
            <div style="margin-bottom: 1rem;">
                <button 
                type="submit"
                style="width: 100%; background-color: blue; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; transition: background-color 0.2s ease;"
                onmouseover="this.style.backgroundColor='#059669';"
                onmouseout="this.style.backgroundColor='blue';"
                >
                Send Message
                </button>
            </div>

            <!-- Faint Message -->
            <p style="text-align: center; font-size: 0.75rem; color: #9CA3AF; filter: blur(0.4px); margin-top: 0.5rem;">
                Our team will reach out soon with the next steps
            </p>

            </form>


        </div>
        
        <!-- Right Column - Contact Info -->
        <div style="max-width: 700px; margin: 0 auto 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1rem; ">Contact information</h3>
          <p style="font-size: 1rem; font-weight: 400; color: #6B7280; line-height: 1.6; margin-bottom: 2rem;">Have a question? Reach out through one of the options below and our team member will be in touch soon.</p>
          
          <div style="max-width: 700px; margin: 0 auto;">
            <div>
              <h4 style="font-size: 1.125rem;font-weight: 500;color: #111827;margin-bottom: 0.5rem;">Chat us</h4>
              <a href="mailto:info@timglobal.uk" style=" font-size: 1rem;color: blue;text-decoration: none;transition: color 0.2s ease;"onmouseover="this.style.color='#065F46'; this.style.textDecoration='underline';
              "onmouseout="this.style.color='#10B981'; this.style.textDecoration='none';">info@timglobal.uk</a>
            </div>
            
            <div style="margin-top: 2rem; max-width: 700px; margin-left: auto; margin-right: auto;">
            <h4 style="font-size: 1.125rem;font-weight: 500;color: #111827;margin-bottom: 0.5rem;">
                Call us
            </h4>
            <p style="font-size: 1rem; color: #6B7280; margin-bottom: 0.25rem;">
                08038042814
            </p>
            <p  style="font-size: 1rem;color: #6B7280; ">
                08085688274
            </p>
        </div>
            
          </div>
        </div>
    </div>

      <footer style="background-color: #e0f2fe; color: #1f2937; padding: 40px 20px; font-family: Arial, sans-serif;">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 16px; max-width: 1000px; margin: 0 auto;">

        <!-- LOGO + DESCRIPTION + SOCIAL -->
        <div style="flex: 1 1 22%; min-width: 180px; margin-top: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <img src="/removebg-preview.png" alt="Logo" style="width: 90px; height: 29px;" />
          </div>
          <p style="font-size: 9.5px; line-height: 1.4; margin-bottom: 8px;">
            Healthcare innovation through AI-powered orchestration.<br />
            Based in Birmingham, UK.
          </p>
          <div style="display: flex; gap: 8px;">
            <a href="https://linkedin.com"><img src="/linkedin.png" alt="LinkedIn" style="width: 16px;" /></a>
            <a href="https://twitter.com"><img src="/Twitter.png" alt="Twitter" style="width: 16px;" /></a>
            <a href="https://youtube.com"><img src="/youtube.png" alt="YouTube" style="width: 16px;" /></a>
          </div>
        </div>

        <!-- COMPANY -->
        <div style="flex: 1 1 22%; min-width: 140px;">
          <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">Company</h4>
          <p style="margin: 2px 0;"><a href="/about" style="color: #1f2937; font-size: 9.5px; text-decoration: none;">About Us</a></p>
          <p style="margin: 2px 0;"><a href="/product" style="color: #1f2937; font-size: 9.5px; text-decoration: none;">Product</a></p>
          <p style="margin: 2px 0;"><a href="/contact" style="color: #1f2937; font-size: 9.5px; text-decoration: none;">Contact Us</a></p>
        </div>

        <!-- USEFUL LINKS -->
        <div style="flex: 1 1 22%; min-width: 140px;">
          <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">Useful Links</h4>
          <p style="margin: 2px 0;"><a href="/privacy-policy" style="color: #1f2937; font-size: 9.5px; text-decoration: none;">Privacy Policy</a></p>
          <p style="margin: 2px 0;"><a href="/terms-of-service" style="color: #1f2937; font-size: 9.5px; text-decoration: none;">Terms of Service</a></p>
        </div>

        <!-- CONTACT -->
        <div style="flex: 1 1 22%; min-width: 140px;">
          <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 6px;">Contact</h4>
          <p style="font-size: 9.5px; margin: 2px 0;">1B Shaftes Rd, B92 7NF, Solihull, UK</p>
          <p style="font-size: 9.5px; margin: 2px 0;">info@timglobal.uk</p>
          <p style="font-size: 9.5px; margin: 2px 0;">+44 7352 310353</p>
        </div>

      </div>

      <p style="text-align: center; margin-top: 25px; font-size: 10px; color: #6b7280;">
        © 2025 Timglobal. All rights reserved.
      </p>
    </footer>

    </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
const toast = useToast()

const name = ref('')
const email = ref('')
const message = ref('')

async function submitForm() {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    toast.success('Message sent! ✅')
    name.value = ''
    email.value = ''
    message.value = ''
  } catch (err: any) {
    toast.error('Failed to send message: ' + err.message)
  }
}
</script>