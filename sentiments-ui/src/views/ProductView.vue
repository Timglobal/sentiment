<template>
  <div style="font-family: Arial, sans-serif; color: #1f2937; background: #fff;">

    <!-- HERO SECTION -->
    <section style="text-align: center; padding: 60px 20px;">
      <h1 style="font-size: 2rem; font-weight: bold;">
        Transform Your<br /> <span style="color: #2563EB;">Workforce Management</span><br />
        With AI-Powered Insights
      </h1>
      <p style="margin-top: 16px; color: #4B5563; max-width: 600px; margin-inline: auto;">
        Timglobal’s staff sentiment analysis platform empowers organizations to understand,
        engage, and optimize their workforce through intelligent feedback analysis and comprehensive management tools.
      </p>
      <!-- BUTTONS -->
    <div style="margin-top: 30px;">
      <RouterLink :to="isLoggedIn ? '/dashboard' : '/login'">
        <button style="padding: 10px 24px; background-color: #2563EB; color: white; border: none; border-radius: 6px; margin-right: 10px;">
          Get Started
        </button>
      </RouterLink>  
      <RouterLink to="/about">
        <button style="padding: 10px 24px; background-color: #E5E7EB; color: #111827; border: none; border-radius: 6px;">
          Learn More
        </button>
      </RouterLink>
    </div>
    </section>

    <!-- FEATURES SECTION -->
    <section style="padding: 40px 20px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; max-width: 960px; margin: 0 auto;">
        <RouterLink
          v-for="card in features"
          :key="card.title"
          :to="card.title === 'Spotlight' ? '/spotlight' : card.title === 'Telemarketing' ? '/tele' : ''"
          style="flex: 0 0 23%; padding: 12px; margin: 0 1% 20px 1%; background: white; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center; text-decoration: none; color: inherit; box-sizing: border-box;">
          
          <img src="/Resource.png" alt="icon" style="width: 22px; height: 22px; margin-bottom: 6px;" />
          <h3 style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">{{ card.title }}</h3>
          <p style="font-size: 10px; color: #4B5563;">{{ card.description }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- METRICS SECTION -->
    <section style="text-align: center; padding: 50px 20px; background-color: #F9FAFB;">
      <h2 style="font-size: 1.25rem; font-weight: 600;">Trusted by Leading Organizations</h2>
      <p style="color: #6B7280;">Join thousands of companies improving their workforce management</p>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 40px; margin-top: 30px;">
        <div v-for="metric in metrics" :key="metric.label" style="text-align: center;">
          <h3 style="font-size: 1.5rem; font-weight: bold; color: #1D4ED8;">--</h3>
          <p style="color: #4B5563;">{{ metric.label }}</p>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section style="background-color: #1e40af; color: white; padding: 60px 20px; text-align: center;">
      <h2 style="font-size: 1.8rem; font-weight: 600;">Ready To Transform Healthcare Environments</h2>
      <div style="margin-top: 24px; display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <RouterLink to="/request-demo">
          <button style="background-color: white; color: #1e40af; padding: 10px 24px; border-radius: 9999px; font-weight: 600; border: none;">
            Request a Demo
          </button>
        </RouterLink>
        <RouterLink to="/contact">
          <button style="border: 2px solid white; background: transparent; color: white; padding: 10px 24px; border-radius: 9999px; font-weight: 600;">
            Get in Touch
          </button>
        </RouterLink>
      </div>
    </section>

    <!-- FOOTER -->
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

<script>
export default {
  data() {
    return {
      features: [
        { title: "Spotlight", description: "Track staff sentiment in real-time with advanced AI-powered analysis." },
        { title: "Staff Management", description: "Comprehensive tools for managing workforce feedback and development." },
        { title: "Project Management", description: "Streamlined task workflows with intelligent task allocation and tracking." },
        { title: "Telemarketing", description: "Enterprise-grade security with complete data privacy protection." }
      ],
      metrics: [
        { label: "Companies" },
        { label: "Employees" },
        { label: "Feedback Analyzed" },
        { label: "Uptime" }
      ]
    }
  }
}
</script>
