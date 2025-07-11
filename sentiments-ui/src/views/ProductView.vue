<template>
  <div style="font-family: Arial, sans-serif; color: #1f2937; background: #fff;">

    <!-- HERO SECTION -->
    <section style="text-align: center; padding: 60px 20px;">
      <h1 style="font-size: 2rem; font-weight: bold;">
        Transform Your <span style="color: #2563EB;">Workforce Management</span><br />
        With AI-Powered Insights
      </h1>
      <p style="margin-top: 16px; color: #4B5563; max-width: 600px; margin-inline: auto;">
        Timglobal’s staff sentiment analysis platform empowers organizations to understand,
        engage, and optimize their workforce through intelligent feedback analysis and comprehensive management tools.
      </p>
      <div style="margin-top: 30px;">
        <button style="padding: 10px 24px; background-color: #2563EB; color: white; border: none; border-radius: 6px; margin-right: 10px;">Get Started</button>
        <button style="padding: 10px 24px; background-color: #E5E7EB; color: #111827; border: none; border-radius: 6px;">Learn More</button>
      </div>
    </section>

    <!-- FEATURES -->
    <section style="padding: 40px 20px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
        <div v-for="card in features" :key="card.title" style="width: 240px; padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">{{ card.title }}</h3>
          <p style="font-size: 14px; color: #4B5563;">{{ card.description }}</p>
        </div>
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
        <button style="background-color: white; color: #1e40af; padding: 10px 24px; border-radius: 9999px; font-weight: 600; border: none;">
          Request a Demo
        </button>
        <button style="border: 2px solid white; background: transparent; color: white; padding: 10px 24px; border-radius: 9999px; font-weight: 600;">
          Get in Touch
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="background-color: #f9fafb; color: #1f2937; padding: 60px 20px;">
      <div style="max-width: 1200px; margin: auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2rem;">

        <!-- Company Info -->
        <div style="flex: 1; min-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 1rem;">Timglobal</h3>
          <p style="font-size: 0.9rem;">
            A modern solution for monitoring staff well-being and professional sentiment within healthcare environments.
          </p>
        </div>

        <!-- Useful Links -->
        <div style="flex: 1; min-width: 150px;">
          <h4 style="font-weight: bold; margin-bottom: 1rem;">Useful Links</h4>
          <p><a href="#" style="color: #1f2937; text-decoration: none;">About Us</a></p>
          <p><a href="#" style="color: #1f2937; text-decoration: none;">Product</a></p>
          <p><a href="#" style="color: #1f2937; text-decoration: none;">Contact</a></p>
        </div>

        <!-- Contact -->
        <div style="flex: 1; min-width: 200px;">
          <h4 style="font-weight: bold; margin-bottom: 1rem;">Contact Us</h4>
          <p>1B Shaolford Road, B92 7NF, Solihull, Birmingham, UK</p>
          <p>info@timglobal.uk</p>
          <p>+44 7352 310353</p>
        </div>
      </div>

      <div style="text-align: center; font-size: 0.75rem; margin-top: 2rem; color: #6B7280;">
        © 2025 Timglobal Ltd. All rights reserved.
      </div>
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
