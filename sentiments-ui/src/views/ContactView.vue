
<!-- src/views/ContactView.vue -->
<template>
  
    <div class="max-w-6xl mx-auto">
      <!-- Header with logo would go here -->
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <!-- Left Column - Contact Form -->
        <div>
          <h2 style="font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 1rem; line-height: 1.3;">Let's Build the Future of Healthcare Together</h2>
          <p style="font-size: 1rem; font-weight: 400; color: #6B7280; line-height: 1.7; margin-bottom: 2rem;">We're excited to learn more about your needs and how Tim Global Technologies Ltd. can help. Please fill out the form below, and we'll get back to you promptly.</p>
          
          <form style="background-color: white; padding: 2rem; border-radius: 0.75rem; max-width: 500px; margin: auto;">
  
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
                style="width: 100%; background-color: #10B981; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer; transition: background-color 0.2s ease;"
                onmouseover="this.style.backgroundColor='#059669';"
                onmouseout="this.style.backgroundColor='#10B981';"
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
              <a href="mailto:info@timglobal.uk" style=" font-size: 1rem;color: #10B981;text-decoration: none;transition: color 0.2s ease;"onmouseover="this.style.color='#065F46'; this.style.textDecoration='underline';
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
            <div style="padding-top: 1.5rem; max-width: 700px; margin: auto;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <img 
                  src="/logo.png" 
                  alt="Tim Global Logo"
                  style="height: 3.5rem; width: 3.5rem; border-radius: 65%; display: block;"
                >
                <div style="line-height: 1.1;">
                <h2 style=" font-size: 1rem; font-weight: 600;color: #111827; margin: 0;">Timglobal</h2>
                </div>
              </div>
              <p style="font-size: 0.875rem;color: #6B7280;margin-top: 0.75rem;line-height: 1.5;">A modern solution for monitoring staff well-being and professional sentiment within healthcare environments</p>
              
              <!-- Absolute smallest social icons (2.5×2.5px with hover effects) -->
                <div class="flex space-x-2 mt-2">
                    <a href="#" class="text-gray-400 hover:text-green-500 block">
                        <img src="/twitter-icon.png" alt="Twitter" class="block" style="height: 1.5rem; width: 1.5rem;">
                    </a>
                    <a href="#" class="text-gray-400 hover:text-green-500 block">
                        <img src="/linkedin-icon.png" alt="LinkedIn" class="block" style="height: 1.5rem; width: 1.5rem;">
                    </a>
                    <a href="#" class="text-gray-400 hover:text-green-500 block">
                        <img src="/instagram-icon.png" alt="Instagram" class="block" style="height: 1.5rem; width: 1.5rem;">
                    </a>
                    <a href="#" class="text-gray-400 hover:text-green-500 block">
                        <img src="/youtube-icon.png" alt="YouTube" class="block" style="height: 1.5rem; width: 1.5rem;">
                    </a>
                </div>
            </div>
          </div>
        </div>
    </div>

      <footer style="background-color: #f0fdf4; color: #374151; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; padding: 2rem 1.5rem; margin-top: 4rem;">
  
        <!-- Main footer flex container -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 1rem; max-width: 1200px; margin: 0 auto;">
            
            <!-- Navigation links -->
            <div style="display: flex; gap: 1.5rem;">
            <a href="#" style="color: #4b5563; text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#4b5563'">About us</a>
            <a href="#" style="color: #4b5563; text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#4b5563'">Product</a>
            <a href="#" style="color: #4b5563; text-decoration: none; transition: color 0.2s ease;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#4b5563'">Contact us</a>
            </div>

            <!-- Legal links -->
            <div style="display: flex; gap: 1.5rem;">
            <a href="#" style="color: #4b5563; text-decoration: none; font-size: 13px; transition: color 0.2s ease;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#4b5563'">Privacy Policy</a>
            <a href="#" style="color: #4b5563; text-decoration: none; font-size: 13px; transition: color 0.2s ease;" onmouseover="this.style.color='#059669'" onmouseout="this.style.color='#4b5563'">Terms of Service</a>
            </div>
        </div>

        <!-- Copyright -->
        <div style="margin-top: 1.5rem; text-align: center; color: #6b7280; font-size: 12px;">
            © 2025 <span style="color: #374151; font-weight: 500;">Tim Global Technologies Ltd.</span> All rights reserved.
        </div>

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