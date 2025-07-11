<template>
  <div style="font-family: Arial, sans-serif; color: #222; padding: 20px;">

    <!-- HERO SECTION WITH IMAGE -->
    <section style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 50px 0;">
      <div style="flex: 1; min-width: 280px; padding: 20px;">
        <h1 style="font-size: 1.6rem; font-weight: bold; line-height: 1.3;">Empowering Healthcare Through Project Orchestration</h1>
        <p style="margin: 20px 0; font-size: 0.9rem;">Timglobal streamlines healthcare operations, maximizes resource efficiency, and enhances patient outcomes.</p>
        <div style="margin-top: 30px;">
          <button style="margin-right: 10px; padding: 10px 24px; background-color: #2563EB; color: white; border: none; border-radius: 6px;">Request Demo</button>
          <button style="padding: 10px 24px; background-color: #E5E7EB; border: none; border-radius: 6px;">See How It Works</button>
        </div>
      </div>
      <div style="flex: 1; min-width: 280px; text-align: center;">
        <img src="/HOSPITAL AI.png" alt="Healthcare Staff" style="width: 100%; max-width: 500px; border-radius: 12px;" />
      </div>
    </section>

    <!-- CORE CAPABILITIES -->
    <section style="text-align: center; margin: 60px 0;">
      <h2 style="font-size: 24px; color: #1D4ED8;">Core Capabilities</h2>
      <p style="color: #555; font-size: 14px; max-width: 600px; margin: 10px auto;">
        We deliver measurable improvements across critical healthcare operations, backed by extensive research and real-world implementation.
      </p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 30px;">
        <div style="width: 220px; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
          <h3 style="font-size: 18px;">⚙️ Workflow Optimization</h3>
          <p>Automate tasks and improve patient outcomes with better accuracy.</p>
        </div>
        <div style="width: 220px; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
          <h3 style="font-size: 18px;">📊 Resource Allocation</h3>
          <p>Use smart analytics to manage resources effectively.</p>
        </div>
        <div style="width: 220px; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
          <h3 style="font-size: 18px;">🛡️ Risk Mitigation</h3>
          <p>Identify issues before they impact patient care.</p>
        </div>
      </div>
    </section>

    <!-- TRUST SECTION -->
    <section style="display: flex; gap: 30px; align-items: center; background-color: #E0F0FF; padding: 40px; margin: 60px 0;">
      <div style="flex: 1;">
        <h2>Why Healthcare Providers Trust Timglobal</h2>
        <p>
          Timglobal partners with NHS & private care providers to deliver measurable improvements, backed by academic research and NHS pilot deployments.
        </p>
        <a href="#" style="color: #1D4ED8;">Learn more →</a>
      </div>
      <img src="/nurse and patient.png" alt="Doctors" style="width: 300px; border-radius: 10px;" />
    </section>

    <!-- OUR SERVICES -->
    <section style="text-align: center; margin-bottom: 60px;">
      <h2 style="font-size: 24px; color: #1D4ED8;">Our Services</h2>
      <p style="color: #555; font-size: 14px; max-width: 600px; margin: 10px auto;">
        Comprehensive healthcare technology solutions designed to transform operations, improve patient outcomes, and drive innovation in your organisation.
      </p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 20px;">
        <div v-for="(service, index) in services" :key="index" :style="{ backgroundColor: service.color, padding: '16px', width: '180px', borderRadius: '8px', color: '#fff' }">
          <h3 style="font-size: 16px; margin-bottom: 6px;">{{ service.title }}</h3>
          <p style="font-size: 13px; color: #f0f0f0;">{{ service.description }}</p>
        </div>
      </div>
    </section>

    <!-- CONTACT US FORM -->
    <section style="margin: 60px 0;">
      <h2 style="text-align: center;">Contact Information</h2>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; margin-top: 30px;">
        <div style="flex: 1; min-width: 250px;">
          <p><strong>Email:</strong> info@timglobal.uk</p>
          <p><strong>Call us:</strong> +44 7352 310353</p>
        </div>
        <form @submit.prevent="sendMessage" style="flex: 1; min-width: 300px;">
          <input v-model="form.name" placeholder="Full Name" required style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc;" />
          <input v-model="form.email" placeholder="Email" type="email" required style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc;" />
          <textarea v-model="form.message" placeholder="Message" required style="width: 100%; padding: 10px; height: 100px; border: 1px solid #ccc;"></textarea>
          <button type="submit" style="margin-top: 10px; padding: 10px 20px; background-color: #2563EB; color: white; border: none; border-radius: 5px;">
            Send Message
          </button>
        </form>
      </div>
    </section>

    <!-- CTA Section -->
    <section style="background-color: #1e40af; color: white; padding: 80px 20px; text-align: center;">
      <h2 style="font-size: 2rem; font-weight: 600; margin-bottom: 1.5rem;">
        Ready To Transform Healthcare Environments
      </h2>
      <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <button style="background-color: white; color: #1e40af; padding: 10px 24px; border-radius: 9999px; font-weight: 600; border: none;">
          Request a Demo
        </button>
        <button style="border: 2px solid white; background: transparent; color: white; padding: 10px 24px; border-radius: 9999px; font-weight: 600;">
          Get in Touch
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="background-color: #111827; color: white; padding: 60px 20px;">
      <div style="max-width: 1200px; margin: auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem;">
        <div style="flex: 1; min-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 1rem;">Timglobal</h3>
          <p style="font-size: 0.9rem;">
            A modern solution for monitoring staff well-being and professional sentiment within healthcare environments.
          </p>
          <div style="margin-top: 1rem; display: flex; gap: 1rem;">
            <a href="https://twitter.com/yourhandle" target="_blank"><img src="/twitter-icon.png" alt="Twitter" style="width: 24px;" /></a>
            <a href="https://linkedin.com/company/timglobal" target="_blank"><img src="/linkedin-icon.png" alt="LinkedIn" style="width: 24px;" /></a>
            <a href="https://instagram.com/yourhandle" target="_blank"><img src="/instagram-icon.png" alt="Instagram" style="width: 24px;" /></a>
          </div>
        </div>

        <div style="flex: 1; min-width: 250px;">
          <h4 style="font-weight: bold; margin-bottom: 1rem;">Contact Us</h4>
          <p style="font-size: 0.9rem;">1B Shaolford Road, B92 7NF, Solihull, Birmingham, UK</p>
          <p style="font-size: 0.9rem;">info@timglobal.uk</p>
          <p style="font-size: 0.9rem;">+44 7352 310353</p>
        </div>

        <div style="flex: 1; min-width: 250px;">
          <h4 style="font-weight: bold; margin-bottom: 1rem;">Useful Links</h4>
          <p><a href="#" style="color: white; text-decoration: none;">About Us</a></p>
          <p><a href="#" style="color: white; text-decoration: none;">Product</a></p>
          <p><a href="#" style="color: white; text-decoration: none;">Contact Us</a></p>
        </div>
      </div>
      <div style="text-align: center; font-size: 0.75rem; margin-top: 2rem; color: #9ca3af;">
        © 2025 Timglobal. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
import { API_BASE_URL } from '@/config'

export default {
  data() {
    return {
      services: [
        { title: "Sentiment Analysis", description: "Analyze patient and staff feedback.", color: "#E91E63" },
        { title: "Project Management", description: "Streamlined workflows and progress tracking.", color: "#2196F3" },
        { title: "Healthcare Surveillance", description: "Real-time health monitoring.", color: "#4CAF50" },
        { title: "Healthcare Consulting", description: "Digital transformation strategies.", color: "#FFC107" },
        { title: "Training and Support", description: "Ongoing support and training.", color: "#F44336" },
        { title: "Research and Collaboration", description: "Academic partnerships for innovation.", color: "#00BCD4" }
      ],
      form: {
        name: '',
        email: '',
        message: ''
      }
    }
  },
  methods: {
    async sendMessage() {
      try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        if (res.ok) {
          alert('Message sent!');
          this.form.name = '';
          this.form.email = '';
          this.form.message = '';
        } else {
          alert('Failed to send message.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred.');
      }
    }
  }
}
</script>
