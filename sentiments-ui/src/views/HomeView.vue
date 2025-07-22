<template>
  <div style="font-family: Arial, sans-serif; color: #1f2937; ">
    
    <!-- HERO SECTION -->
    <section style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding-bottom: 60px;">
      <div style="flex: 1; min-width: 280px; padding-right: 20px;">
        <h1 style="font-size: 42px; font-weight: 700; margin-bottom: 20px; line-height: 1.4; font-family: 'Segoe UI', Roboto, sans-serif; color: #1f2937;">
          Empowering Healthcare Through <br /> Project Orchestration
        </h1>
        <p style="font-size: 18px; color: #4b5563; margin-bottom: 30px; max-width: 600px;">
          Timglobal streamlines healthcare operations, maximizes resource efficiency, and enhances patient outcomes.
        </p>

        <div style="display: flex; gap: 15px;">
          <!-- Request Demo Button -->
          <RouterLink to="/request-demo">
            <button style="padding: 12px 24px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
              Request Demo
            </button>
          </RouterLink>

          <!-- See How It Works Button -->
          <RouterLink to="/dashboard">
            <button style="padding: 12px 24px; background-color: #e5e7eb; color: #111827; border: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              See How It Works
            </button>
          </RouterLink>
        </div>
      </div>

      <div style="flex: 1; min-width: 280px; text-align: center; padding-top: 20px;">
        <img src="/Timglobal Hero Section IMAGE.png" alt="Healthcare Image" style="width: 100%; max-width: 500px; border-radius: 10px;" />
      </div>
    </section>


    <!-- CORE CAPABILITIES -->
    <section style="text-align: center; padding: 40px 0;">
      <h2 style="font-size: 28px; font-weight: bold; color: #1d4ed8;">Core <span style="color: #111827;">Capabilities</span></h2>
      <p style="font-size: 15px; color: #6b7280; max-width: 600px; margin: 10px auto 30px;">
        We deliver measurable improvements across critical healthcare operations, backed by extensive research and real-world implementation.
      </p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
        <div v-for="(cap, i) in capabilities" :key="i" style="flex: 1 1 280px; max-width: 100%; box-sizing: border-box; padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; text-align: left;">
          <img :src="cap.icon" alt="" style="width: 28px; height: 28px; margin-bottom: 6px;" />
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">{{ cap.title }}</h3>
          <p style="font-size: 14px; color: #4b5563;">{{ cap.description }}</p>
        </div>
      </div>
    </section>

    <!-- TRUST SECTION -->
    <div style="background-color: #e0f2fe; width: 100%;">
      <section class="trust-section" style="max-width: 1200px; margin: 0 auto; padding: 50px 20px; display: flex; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 280px; padding-right: 20px;">
          <h2 style="font-size: 26px; font-weight: bold; margin-bottom: 16px;">Why Healthcare Providers Trust Timglobal</h2>
          <p style="font-size: 15px; color: #374151; margin-bottom: 16px;">
            Our AI-powered platform streamlines workflows, optimizes decisions, and improves operations. Backed by NHS deployments and academic research.
          </p>
          <a href="#" style="color: #2563eb; font-weight: 500; text-decoration: none;">Learn more →</a>
        </div>
        <div style="flex: 1; min-width: 240px; text-align: center;">
          <img src="/3RD SECTION M.png" alt="Doctors" style="width: 100%; max-width: 320px; border-radius: 10px;" />
        </div>
      </section>
    </div>


    <!-- OUR SERVICES -->
    <section style="text-align: center; margin-bottom: 60px;">
      <h2 style="font-size: 26px; color: #1d4ed8; font-weight: bold;">Our <span style="color: #111827;">Services</span></h2>
      <p style="font-size: 13px; color: #6b7280; max-width: 600px; margin: 10px auto 30px;">
        Comprehensive healthcare technology solutions designed to transform operations, improve patient outcomes, and drive innovation across your organizations.
      </p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
        <div v-for="(service, index) in services" :key="index" :style="{
          flex: '1 1 100%',
          maxWidth: '320px',
          backgroundColor: service.color,
          padding: '20px',
          width: '220px',
          borderRadius: '10px',
          color: '#ffffff',
          textAlign: 'left',
          boxSizing: 'border-box'
        }">
          <img :src="service.icon" alt="" style="width: 26px; height: 26px; margin-bottom: 8px;" />
          <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 4px;">{{ service.title }}</h3>
          <div style="background-color: #e0f2ff; color: #111827; padding: 10px 12px; border-radius: 6px; font-size: 12px;">
          <p style="margin: 0 0 8px;">{{ service.description }}</p>
          <a href="#" :style="{ color: service.color, fontWeight: 'bold', fontSize: '12px', textDecoration: 'none' }">
            Learn more →
          </a>
        </div>
        </div>
      </div>
    </section>

    <div style="text-align: center; font-size: 13px; color: #6b7280; margin-bottom: 10px;">
        <span style="height: 8px; width: 8px; background-color: #34d399; display: inline-block; border-radius: 50%; margin-right: 6px;"></span>
         more services loading...
      </div>


    <!-- MOBILE APP COMING SOON -->
  <div style="background-color: #f0f8ff; padding: 60px 0;">
    <section style="max-width: 1200px; margin: auto; padding: 0 20px;">

      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 30px;">
        <!-- LEFT CONTENT -->
        <div style="flex: 1; min-width: 280px; max-width: 500px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          <!-- Heading -->
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Mobile App <span style="color: #2563eb;">Coming Soon</span></h2>

          <!-- Feature boxes -->
          <div style="margin-bottom: 30px;">
          <!-- Real-time Notifications -->
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <img src="/Real.png" alt="Notifications" style="width: 28px; height: 28px; margin-right: 10px;" />
            <div>
              <h4 style="font-size: 14px; font-weight: bold; margin: 0;">Real-time Notifications</h4>
              <p style="font-size: 13px; color: #374151; margin: 2px 0 0;">Instant alerts for critical system events.</p>
            </div>
          </div>

          <!-- Mobile Dashboard -->
          <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
            <img src="/Mobile.png" alt="Dashboard" style="width: 28px; height: 28px; margin-right: 10px;" />
            <div>
              <h4 style="font-size: 14px; font-weight: bold; margin: 0;">Mobile Dashboard</h4>
              <p style="font-size: 13px; color: #374151; margin: 2px 0 0;">Access key metrics and analytics anywhere.</p>
            </div>
          </div>

          <!-- Schedule Management -->
          <div style="display: flex; align-items: flex-start;">
            <img src="/Schedule.png" alt="Schedule" style="width: 28px; height: 28px; margin-right: 10px;" />
            <div>
              <h4 style="font-size: 14px; font-weight: bold; margin: 0;">Schedule Management</h4>
              <p style="font-size: 13px; color: #374151; margin: 2px 0 0;">Manage staff schedules and appointments.</p>
            </div>
          </div>
        </div>


          <!-- Waitlist Box -->
          <div style="background: white; padding: 16px; border-radius: 8px; ">
            <p style="font-weight: bold; margin: 0 0 6px;">Join the Waitlist</p>
            <p style="font-size: 11px; color: #4b5563; margin-bottom: 10px;">Be the first to know when our mobile app launches. Get early access and exclusive features.</p>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px;">
              <input v-model="waitlistEmail" placeholder="Enter your email address" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
              <RouterLink :to="`/request-demo?email=${waitlistEmail}`">
                <button style="padding: 10px 16px; background-color: #2563eb; color: white; border: none; border-radius: 4px; width: 100%;">Join Waitlist</button>
              </RouterLink>
            </div>
            <p style="font-size: 10px; color: #6b7280; margin: 0;">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>

        <!-- RIGHT IMAGE -->
        <div style="flex: 1; min-width: 240px; text-align: center;">
          <img src="/coming soon.png" alt="Coming Soon App" style="width: 100%; max-width: 320px; border-radius: 10px;" />
        </div>
      </div>
    </section>
  </div> 


    <!-- FAQ SECTION -->
    <section style="margin-bottom: 60px;">
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Frequently Asked Questions</h2>
      <details v-for="(faq, index) in faqs" :key="index" style="margin-bottom: 10px; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 10px;">
        <summary style="cursor: pointer; font-weight: bold; font-size: 15px;">{{ faq.question }}</summary>
        <p style="margin-top: 8px; font-size: 14px; color: #4b5563;">{{ faq.answer }}</p>
      </details>
    </section>

    <!-- CONTACT SECTION -->
    <section style="margin-bottom: 60px;">
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Contact Information</h2>
      <p style="font-size: 12px; margin-bottom: 30px;">
        Have a question? Reach out through one of the options below <br />
        and our team will be in touch shortly.
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 0; align-items: flex-start;">
        
        <!-- CONTACT INFO -->
        <div style="flex: 1; min-width: 280px; padding: 30px;">
          <p style="margin-bottom: 20px;"><strong>💬 Chat us</strong><br />info@timglobal.uk</p>
          <p><strong>📞 Call us</strong><br />+44 7352 310353</p>
        </div>

        <!-- Vertical Divider -->
        <div style="width: 1px; background-color: #bfdbfe; height: auto;"></div>

        <!-- CONTACT FORM -->
        <form @submit.prevent="sendMessage" style="flex: 2; min-width: 320px; padding: 30px; background-color: white;">
          
          <!-- Name -->
          <div style="margin-bottom: 1.25rem;">
            <label for="name" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Name</label>
            <input
              v-model="form.name"
              id="name"
              type="text"
              placeholder="Your full name"
              required
              style="width: 50%; margin-top: 0.25rem; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.75rem; color: #111827;"
            />
          </div>

          <!-- Email -->
          <div style="margin-bottom: 1.25rem;">
            <label for="email" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Email Address</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              placeholder="what is your email address?"
              required
              style="width: 50%; margin-top: 0.25rem; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.75rem; color: #111827;"
            />
          </div>

          <!-- Message -->
          <div style="margin-bottom: 1.25rem;">
            <label for="message" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151;">Message</label>
            <textarea
              v-model="form.message"
              id="message"
              rows="4"
              placeholder="Share your thoughts with us"
              required
              style="width: 50%; margin-top: 0.25rem; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 0.75rem; color: #111827;"
            ></textarea>
          </div>

          <!-- Button -->
          <div style="margin-bottom: 1rem;">
            <button
              type="submit"
              style="width: 50%; background-color: #2563eb; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; border: none; cursor: pointer;"
            >
              Send Message
            </button>
          </div>

          <!-- Faint Message -->
          <p style="text-align: left; font-size: 0.75rem; color: #9CA3AF; filter: blur(0.4px); margin-top: 0.5rem;">
            Our team will reach out soon with the next steps.
          </p>
        </form>
      </div>
    </section>
    <footer style="background-color: #e0f2fe; color: #1f2937; padding: 40px 20px; font-family: Arial, sans-serif;">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 16px; max-width: 1000px; margin: 0 auto;">

        <!-- LOGO + DESCRIPTION + SOCIAL -->
        <div style="flex: 1 1 22%; min-width: 180px; margin-top: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <img src="/removebg-preview.png" alt="Logo" style="width: 110px; height: 29px;" />
          </div>
          <p style="font-size: 10.5px; line-height: 1.4; margin-bottom: 8px;">
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
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">Company</h4>
          <p style="margin: 2px 0;"><a href="/about" style="color: #1f2937; font-size: 10.5px; text-decoration: none;">About Us</a></p>
          <p style="margin: 2px 0;"><a href="/product" style="color: #1f2937; font-size: 10.5px; text-decoration: none;">Product</a></p>
          <p style="margin: 2px 0;"><a href="/contact" style="color: #1f2937; font-size: 10.5px; text-decoration: none;">Contact Us</a></p>
        </div>

        <!-- USEFUL LINKS -->
        <div style="flex: 1 1 22%; min-width: 140px;">
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">Useful Links</h4>
          <p style="margin: 2px 0;"><a href="/privacy-policy" style="color: #1f2937; font-size: 10.5px; text-decoration: none;">Privacy Policy</a></p>
          <p style="margin: 2px 0;"><a href="/terms-of-service" style="color: #1f2937; font-size: 10.5px; text-decoration: none;">Terms of Service</a></p>
        </div>

        <!-- CONTACT -->
        <div style="flex: 1 1 22%; min-width: 140px;">
          <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">Contact</h4>
          <p style="font-size: 10.5px; margin: 2px 0;">1B Shaftes Rd, B92 7NF, Solihull, UK</p>
          <p style="font-size: 10.5px; margin: 2px 0;">info@timglobal.uk</p>
          <p style="font-size: 10.5px; margin: 2px 0;">+44 7352 310353</p>
        </div>

      </div>

      <p style="text-align: center; margin-top: 25px; font-size: 11px; color: #6b7280;">
        © 2025 Timglobal. All rights reserved.
      </p>
    </footer>



  </div>
</template>

<script>
import { API_BASE_URL } from '@/config'
import { useToast } from 'vue-toastification'
const toast = useToast()


export default {
  data() {
    return {
        services: [
        { title: "Sentiment Analysis", icon: "/iconoir_brain.png", description: "Analysis of patient feedback and staff communications.", color: "#1e3a8a" },
        { title: "Telemarketing", icon: "/tele.png", description: "Streamlined workflows with intelligent task tracking.", color: "#047857" },
        { title: "Healthcare Surveillance", icon: "/Healthcare.png", description: "Real-time monitoring for health trends.", color: "#0284c7" },
        { title: "Project Management", icon: "/tele.png", description: "Workflow automation and task progress tracking.", color: "#059669" },
        { title: "Healthcare Consulting", icon: "/fa6-solid_handshake.png", description: "Digital transformation and strategy.", color: "#1d4ed8" },
        { title: "Research & Collaboration", icon: "/streamline_collaborations-idea-solid.png", description: "Academic partnerships for innovation.", color: "#10b981" },
        { title: "Training and Support", icon: "/mdi_graduation-cap.png", description: "Support and training programs.", color: "#2563eb" }
      ],
      capabilities: [
        { title: "Workflow Optimization", icon: "/material-symbols_settings-outline-rounded.png", description: "Automation that reduces manual work and improves care." },
        { title: "Resource Allocation", icon: "/Resource.png", description: "Manage resources with predictive analytics." },
        { title: "Risk Mitigation", icon: "/secure 1.png", description: "Assess risk to improve decisions and outcomes." }
      ],
      faqs: [
        { question: "What is Timglobal Ltd?", answer: "Timglobal is an AI-powered healthcare orchestration platform." },
        { question: "How does the AI-powered project orchestration work?", answer: "It automates workflows, allocates resources, and supports real-time decision-making." },
        { question: "What are the benefits of using Timglobal Ltd?", answer: "Better outcomes, increased efficiency, and improved staff satisfaction." }
      ],
      form: {
        name: '',
        email: '',
        message: ''
      },
      waitlistEmail: ''
    }
  },
  methods: {
    async sendMessage() {
      try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        })
        if (res.ok) {
          toast.success('Message sent!')
          this.form.name = ''
          this.form.email = ''
          this.form.message = ''
        } else {
          toast.success('Failed to send message.')
        }
      } catch (err) {
        console.error(err)
        toast.error('An error occurred.')
      }
    }
  }
}
</script>
<style scoped>
@media (max-width: 768px) {
  .trust-section {
    flex-direction: column;
    text-align: center;
  }

  .trust-section > div {
    padding-right: 0 !important;
  }
}

</style>