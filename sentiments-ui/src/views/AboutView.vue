<template>
  <div style="font-family: 'Segoe UI', sans-serif; color: #333;">
    
    <!-- WHO WE ARE (on image background) -->
    <section
      style="
        background-image: url('/medical background.png');
        background-size: cover;
        background-position: center;
        padding: 100px 20px;
        text-align: center;
        color: white;
      "
    >
      <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">
        Who We Are
      </h2>
      <p style="max-width: 800px; margin: auto; font-size: 1rem; line-height: 1.7;">
        At Tim Global Technologies Ltd, we are dedicated to bridging the gap between clinical care and artificial intelligence. Our mission is to empower healthcare professionals with cutting-edge AI solutions that enhance patient outcomes and streamline workflows.
      </p>
    </section>

    <!-- MISSION & VISION (side by side) -->
    <section style="padding: 80px 20px; background-color: white;">
      <h2 style="text-align: center; font-size: 1.8rem; font-weight: 600; margin-bottom: 3rem;">
        Our Mission & Vision
      </h2>
      <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 60px;">
        <!-- Mission -->
        <div style="flex: 1; max-width: 400px; text-align: center;">
          <img src="/HOSPITAL AI.png" alt="Mission" style="width: 150px; height: 150px; margin-bottom: 1rem;" />
          <h3 style="font-size: 1.2rem; font-weight: bold;">Our Mission</h3>
          <p style="font-size: 0.95rem; margin-top: 0.5rem;">
            To revolutionize healthcare through ethical and responsible AI, seamlessly integrating technology with human expertise to deliver exceptional patient care.
          </p>
        </div>

        <!-- Vision -->
        <div style="flex: 1; max-width: 400px; text-align: center;">
          <img src="/doctor Ai.png" alt="Vision" style="width: 150px; height: 150px; margin-bottom: 1rem;" />
          <h3 style="font-size: 1.2rem; font-weight: bold;">Our Vision</h3>
          <p style="font-size: 0.95rem; margin-top: 0.5rem;">
            To be the leading provider of AI-powered healthcare solutions, known for innovation, integrity, and improving lives globally.
          </p>
        </div>
      </div>
    </section>

    <!-- CORE VALUES (boxed with emojis) -->
    <section style="background-color: #f7f7f7; padding: 80px 20px; text-align: center;">
      <h2 style="font-size: 1.8rem; font-weight: 600; margin-bottom: 2rem;">Our Core Values</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; max-width: 800px; margin: auto;">
        <div style="padding: 12px 24px; border: 1px solid #ccc; border-radius: 20px; font-size: 0.75rem; background-color: white;">💡 Innovation</div>
        <div style="padding: 12px 24px; border: 1px solid #ccc; border-radius: 20px; font-size: 0.75rem; background-color: white;">🧭 Integrity</div>
        <div style="padding: 12px 24px; border: 1px solid #ccc; border-radius: 20px; font-size: 0.75rem; background-color: white;">❤️ Patient-Centricity</div>
        <div style="padding: 12px 24px; border: 1px solid #ccc; border-radius: 20px; font-size: 0.75rem; background-color: white;">🤝 Collaboration</div>
      </div>
    </section>

    <!-- JOURNEY (timeline-style with arrows) -->
    <section style="background-color: white; padding: 80px 20px; text-align: center;">
      <h2 style="font-size: 1.8rem; font-weight: 600; margin-bottom: 2rem;">Our Journey</h2>
      <div style="border-left: 3px solid #10b981; max-width: 400px; margin: auto; padding-left: 1.5rem;">
        <p>📍 <strong>Company Founded<br/></strong> March 2025</p>
        <p style="margin: 1rem 0;">⬇️</p>
        <p>🚀 <strong>First Pilot<br/></strong>2025</p>
        <p style="margin: 1rem 0;">⬇️</p>
        <p>💡 <strong>Product Launch<br/></strong>2025</p>
        <p style="margin: 1rem 0;">⬇️</p>
        <p>🔐 <strong>ISO 27001 Certification<br/></strong>2025</p>
        <p style="margin: 1rem 0;">⬇️</p>
        <p>📈 <strong> Scaling Operations<br/></strong>2025 - 2026</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section style="background-color: #1e40af; color: white; padding: 80px 20px; text-align: center;">
      <h2 style="font-size: 2rem; font-weight: 600; margin-bottom: 1.5rem;">
        Ready To Transform Healthcare Environments
      </h2>
      <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">

        
        <RouterLink to="/request-demo">
          <button style="background-color: white; color: #1e40af; padding: 10px 24px; border-radius: 9999px; font-weight: 600; border: none;">
            Request a Demo
          </button>
        </RouterLink>

        <!-- Get in Touch (goes to /contact) -->
        <RouterLink to="/contact">
          <button style="border: 2px solid white; background: transparent; color: white; padding: 10px 24px; border-radius: 9999px; font-weight: 600;">
            Get in Touch
          </button>
        </RouterLink>

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
