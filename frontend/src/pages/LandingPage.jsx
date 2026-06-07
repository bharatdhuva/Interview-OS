import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add("h-16", "bg-white/90", "backdrop-blur-md");
          header.classList.remove("h-20");
        } else {
          header.classList.remove("h-16", "bg-white/90", "backdrop-blur-md");
          header.classList.add("h-20");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        :root {
          --primary: #0d631b;
          --primary-container: #2e7d32;
          --on-primary: #ffffff;
          --secondary-container: #acf4a4;
          --on-secondary-container: #307231;
          --surface: #f8faf8;
          --background: #f8faf8;
          --on-background: #191c1b;
          --on-surface-variant: #40493d;
          --surface-container-low: #f2f4f2;
          --surface-container-lowest: #ffffff;
          --outline: #707a6c;
          --outline-variant: #bfcaba;
        }

        .landing-container {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--background);
          color: var(--on-background);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(224, 228, 224, 0.5);
        }

        .hero-gradient {
          background: radial-gradient(circle at 50% -20%, #e8f5e9 0%, #f8faf8 60%);
        }

        /* Custom Spacing Rules - Override standard Tailwind to support Stitch design specs */
        .p-lg { padding: 40px !important; }
        .py-sm { padding-top: 12px !important; padding-bottom: 12px !important; }
        .py-md { padding-top: 24px !important; padding-bottom: 24px !important; }
        .py-lg { padding-top: 40px !important; padding-bottom: 40px !important; }
        .py-xl { padding-top: 64px !important; padding-bottom: 64px !important; }
        .px-xl { padding-left: 64px !important; padding-right: 64px !important; }
        .px-md { padding-left: 24px !important; padding-right: 24px !important; }
        .px-sm { padding-left: 12px !important; padding-right: 12px !important; }
        .py-xs { padding-top: 4px !important; padding-bottom: 4px !important; }
        .px-margin-desktop { padding-left: 48px !important; padding-right: 48px !important; }
        .pt-xl { padding-top: 64px !important; }
        .pb-xl { padding-bottom: 64px !important; }
        .p-xl { padding: 64px !important; }

        /* Compact Hero section padding to bring CTA buttons above the fold */
        .hero-padding {
          padding-top: 24px !important;
          padding-bottom: 24px !important;
        }

        .mb-xs { margin-bottom: 4px !important; }
        .mb-sm { margin-bottom: 12px !important; }
        .mb-md { margin-bottom: 24px !important; }
        .mb-lg { margin-bottom: 40px !important; }
        .mb-xl { margin-bottom: 64px !important; }

        .gap-base { gap: 8px !important; }
        .gap-sm { gap: 12px !important; }
        .gap-md { gap: 24px !important; }
        .gap-lg { gap: 40px !important; }
        .gap-xl { gap: 64px !important; }
        .gap-gutter { gap: 24px !important; }

        /* Custom Typography mapping from Stitch design specs */
        .font-display-lg, .text-display-lg {
          font-size: 48px !important;
          line-height: 56px !important;
          letter-spacing: -0.02em !important;
          font-weight: 700 !important;
        }
        .font-headline-lg, .text-headline-lg {
          font-size: 32px !important;
          line-height: 40px !important;
          letter-spacing: -0.01em !important;
          font-weight: 600 !important;
        }
        .font-headline-md, .text-headline-md {
          font-size: 24px !important;
          line-height: 32px !important;
          font-weight: 600 !important;
        }
        .font-body-lg, .text-body-lg {
          font-size: 18px !important;
          line-height: 28px !important;
          font-weight: 400 !important;
        }
        .font-body-md, .text-body-md {
          font-size: 16px !important;
          line-height: 24px !important;
          font-weight: 400 !important;
        }
        .font-title-lg, .text-title-lg {
          font-size: 20px !important;
          line-height: 28px !important;
          font-weight: 600 !important;
        }
        .font-label-md, .text-label-md {
          font-size: 14px !important;
          line-height: 20px !important;
          letter-spacing: 0.01em !important;
          font-weight: 500 !important;
        }
        .font-label-sm, .text-label-sm {
          font-size: 12px !important;
          line-height: 16px !important;
          font-weight: 600 !important;
        }

        /* Color classes override */
        .bg-primary { background-color: #0d631b !important; }
        .text-primary { color: #0d631b !important; }
        .bg-secondary-container { background-color: #acf4a4 !important; }
        .text-on-secondary-container { color: #307231 !important; }
        .bg-background { background-color: #f8faf8 !important; }
        .text-on-background { color: #191c1b !important; }
        .bg-surface { background-color: #f8faf8 !important; }
        .text-on-surface-variant { color: #40493d !important; }
        .bg-surface-container-low { background-color: #f2f4f2 !important; }
        .bg-surface-container-lowest { background-color: #ffffff !important; }
        .border-outline-variant { border-color: #bfcaba !important; }
        .text-outline { color: #707a6c !important; }
        .bg-primary-container { background-color: #2e7d32 !important; }
        .text-on-primary { color: #ffffff !important; }
        .text-on-secondary { color: #ffffff !important; }

        .text-\[\#0d631b\] { color: #0d631b !important; }
        .text-\[\#a3f69c\] { color: #a3f69c !important; }
        .text-\[\#191c1b\] { color: #191c1b !important; }
        .text-\[\#40493d\] { color: #40493d !important; }
        .text-\[\#707a6c\] { color: #707a6c !important; }
        .bg-\[\#acf4a4\] { background-color: #acf4a4 !important; }
        .text-\[\#307231\] { color: #307231 !important; }
        .border-\[\#bfcaba\] { border-color: #bfcaba !important; }
        .border-\[\#bfcaba\]\/30 { border-color: rgba(191, 202, 186, 0.3) !important; }
        .bg-\[\#0d631b\]\/5 { background-color: rgba(13, 99, 27, 0.05) !important; }
        .bg-\[\#0d631b\]\/10 { background-color: rgba(13, 99, 27, 0.1) !important; }
        .text-\[\#0d631b\]\/20 { color: rgba(13, 99, 27, 0.2) !important; }
        .bg-\[\#f2f4f2\] { background-color: #f2f4f2 !important; }
        .border-\[\#0d631b\] { border-color: #0d631b !important; }

        /* Hover states */
        .hover\:text-primary:hover { color: #0d631b !important; }
        .hover\:bg-primary-container:hover { background-color: #2e7d32 !important; }
        .hover\:bg-surface-container:hover { background-color: #eceeec !important; }
        .hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
        .hover\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
        .hover\:bg-primary-fixed:hover { background-color: #a3f69c !important; }

        /* Dark overrides */
        .dark .dark\:text-primary-fixed { color: #88d982 !important; }
        .dark .dark\:text-outline-variant { color: #bfcaba !important; }
        .dark .dark\:bg-background { background-color: #f8faf8 !important; }
        .dark .dark\:bg-inverse-surface { background-color: #2e3130 !important; }
        .dark .dark\:border-outline { border-color: #707a6c !important; }
        .dark .dark\:bg-zinc-900 { background-color: #18181b !important; }
        .dark .dark\:border-zinc-800 { border-color: #27272a !important; }
        .dark .dark\:text-zinc-400 { color: #a1a1aa !important; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      ` }} />

      <div className="landing-container bg-background text-on-background min-h-screen w-full flex flex-col items-center">
        {/* TopNavBar */}
        <header className="bg-surface dark:bg-background shadow-sm fixed w-full h-20 transition-all duration-300 top-0 left-0 right-0 z-50">
          <nav className="flex justify-between items-center w-full px-margin-desktop max-w-[1280px] mx-auto h-full">
            <div className="flex items-center gap-base">
              <span className="text-title-lg font-title-lg font-bold text-[#0d631b]">InterviewOS</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-lg items-center text-body-md font-body-md">
              <a className="text-[#40493d] hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 border-transparent pb-1 transition-all cursor-pointer active:scale-95 duration-200" href="#platform">Platform</a>
              <a className="text-[#40493d] hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 border-transparent pb-1 transition-all cursor-pointer active:scale-95 duration-200" href="#features">Features</a>
              <a className="text-[#40493d] hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 border-transparent pb-1 transition-all cursor-pointer active:scale-95 duration-200" href="#pricing">Pricing</a>
            </div>

            <div className="flex items-center gap-md">
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block text-[#40493d] hover:text-[#0d631b] font-label-md transition-all duration-200"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-[#0d631b] hover:bg-[#2e7d32] text-white px-md py-sm rounded transition-all cursor-pointer active:scale-95 font-label-md"
              >
                Get Started
              </button>
            </div>
          </nav>
        </header>

        <main className="pt-20 overflow-x-hidden w-full flex flex-col items-center">
          {/* Hero Section */}
          <section id="platform" className="hero-gradient relative hero-padding px-margin-desktop w-full">
            <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-lg items-start lg:pt-6">
              <div className="flex flex-col gap-5">
                <div className="inline-flex items-center px-sm py-xs bg-[#acf4a4] text-[#307231] rounded-full text-label-sm uppercase tracking-wider font-bold">
                  New: AI-Enhanced Reviews
                </div>
                <h1 className="font-display-lg text-display-lg text-[#191c1b] leading-tight">
                  The Engineering<br />
                  Leader's <span className="text-[#0d631b]">Technical<br />
                  Interview Platform.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-[#40493d] max-w-xl">
                  A collaborative environment designed for elite engineering teams. Real-time code execution, persistent whiteboards, and AI insights that reveal a candidate's true potential.
                </p>
                <div className="flex flex-wrap gap-md pt-sm">
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-[#0d631b] hover:bg-[#2e7d32] text-white px-6 md:px-8 lg:px-12 py-md rounded-lg font-title-lg hover:shadow-lg transition-all active:scale-95"
                  >
                    Book a Demo
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="border-2 border-[#0d631b] text-[#0d631b] px-6 md:px-8 lg:px-12 py-md rounded-lg font-title-lg hover:bg-[#eceeec] transition-all active:scale-95"
                  >
                    Start for Free
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs border-2 border-white">JD</div>
                    <div className="w-8 h-8 rounded-full bg-[#acf4a4] text-[#307231] flex items-center justify-center font-bold text-xs border-2 border-white">AS</div>
                    <div className="w-8 h-8 rounded-full bg-[#2e7d32] text-white flex items-center justify-center font-bold text-xs border-2 border-white">MK</div>
                  </div>
                  <span className="text-sm text-[#40493d] font-medium">Join 5,000+ hiring managers today</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-[#0d631b]/5 blur-2xl rounded-full group-hover:bg-[#0d631b]/10 transition-all duration-700"></div>
                <div className="relative bg-[#0d2c1f] rounded-[32px] p-6 shadow-2xl border border-[#bfcaba]/10 overflow-visible">
                  <img
                    alt="Platform Interface Mockup"
                    className="w-full h-auto rounded-2xl"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsL8LVqjFOYP5YZVP_-jyKvHpO0BXowKBAJjvml9JE-gQtHgm8pDuMF57tU-5BgZVPnaKwS3MOYD6G74G25tU_Kuir9mwM1H7EjoZDPnvzZOJeFO2BLheZ0m8jhyFuQW9DhDVT8f3WnEqr_nxTXQKeJZMiSVy4xj2HlnF7AfHcf9-0ZMaY-CQO5Xu1DuGtsVvCq-DOjJWG3Fgc3-CtcLbLcIu2MP4DXdxC3SmBH1plJVND-oKVa_sMVoX8AncDy3FPIPFP1J6xVA8"
                  />
                  {/* Floating AI Performance Score Card */}
                  <div className="absolute -left-6 bottom-10 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-[#bfcaba]/30 z-20 max-w-[260px] transform hover:scale-105 transition-transform duration-300">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#707a6c] mb-1">AI Performance Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-extrabold text-[#0d631b]">94%</span>
                      <span className="text-sm font-semibold text-[#40493d] leading-tight">Top 5% of Candidates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trusted By */}
          <section className="py-lg border-y border-[#bfcaba]/30 bg-surface w-full">
            <div className="w-full max-w-[1280px] mx-auto px-margin-desktop text-center">
              <p className="text-xs uppercase tracking-widest text-[#707a6c] font-bold mb-md">Trusted by 500+ engineering teams worldwide</p>
              <div className="flex flex-wrap justify-between items-center gap-lg md:gap-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-700 max-w-[960px] mx-auto">
                <span className="font-headline-md text-headline-md font-extrabold tracking-widest text-[#191c1b] text-lg">STELLAR</span>
                <span className="font-headline-md text-headline-md font-extrabold tracking-widest text-[#191c1b] text-lg">FLUX</span>
                <span className="font-headline-md text-headline-md font-extrabold tracking-widest text-[#191c1b] text-lg">NEXUS</span>
                <span className="font-headline-md text-headline-md font-extrabold tracking-widest text-[#191c1b] text-lg">APEX</span>
                <span className="font-headline-md text-headline-md font-extrabold tracking-widest text-[#191c1b] text-lg">VORTEX</span>
              </div>
            </div>
          </section>

          {/* Integrations & Tech Stack */}
          <section id="features" className="py-20 px-margin-desktop bg-background w-full border-t border-[#bfcaba]/30">
            <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-y-12 gap-x-8 items-center py-8">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#191c1b] leading-tight">Integrations &amp; Tech Stack</h2>
                <p className="text-body-lg text-[#40493d] max-w-sm leading-relaxed">
                  Compatible with your existing engineering workflow. We provide first-class support for modern environments.
                </p>
              </div>
              <div className="lg:col-span-7 flex flex-col gap-8 lg:pl-16">
                {/* Row 1 */}
                <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5M12 22V12" />
                    </svg>
                    <span>React</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M6 8l3 3-3 3M12 15h6" />
                    </svg>
                    <span>TypeScript</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <span className="text-[10px] font-bold border border-[#707a6c] px-1.5 rounded text-[#707a6c] leading-none py-0.5">js</span>
                    <span>Node.js</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                    <span>AWS</span>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="flex items-center pl-16 md:pl-28">
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 7L3 12l5 5M16 7l5 5-5 5M3 12h18" />
                    </svg>
                    <span>WebRTC</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="py-xl bg-white overflow-hidden relative w-full">
            <div className="w-full max-w-[1280px] mx-auto px-margin-desktop">
              <div className="flex flex-col lg:flex-row gap-lg items-center">
                <div className="lg:w-1/3 flex justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 bg-[#0d631b] rounded-full rotate-6 scale-105"></div>
                    <img
                      alt="CTO Headshot"
                      className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9JgNXQ7kaIa2NQ0Jfn9HHbwxNVuI-a1DKmPjB8XMMCww6EoCANb3yAG7QGQVdyabPMziYj7GkbFzU_74AsxPiCPYNutBAcD5vTDxrc2VtSO_wcRVN510hzTgxnVYVioO3ATQ3h7ukaY_oI_L4Mtzg_zTp6mQZrB9fWW9OMGSdpoCUR56P5cdrA_73o3Pk5zTHlsTYX68ftJ10RKrvNU5C0UUNzXH1u6M_fAl818cUZ9jR6pK5a29i_EA-dIRW7FwU2O-7w5ahIJQ"
                    />
                  </div>
                </div>
                <div className="lg:w-2/3">
                  <span className="material-symbols-outlined text-[#0d631b]/20 text-[80px] leading-none mb-sm">format_quote</span>
                  <blockquote className="font-display-lg text-headline-lg lg:text-display-lg text-[#191c1b] leading-tight mb-md">
                    "InterviewOS transformed our hiring pipeline from a black box into a data-driven science. We reduced time-to-hire by 40% while significantly increasing our engineering quality bar."
                  </blockquote>
                  <div>
                    <p className="font-title-lg text-title-lg text-[#191c1b] font-bold">Marcus Chen</p>
                    <p className="font-label-md text-label-md text-[#40493d]">CTO @ NexGen Data Systems</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Plans */}
          <section className="py-xl px-margin-desktop bg-background w-full" id="pricing">
            <div className="w-full max-w-[1280px] mx-auto">
              <div className="text-center mb-xl">
                <h2 className="font-headline-lg text-headline-lg text-[#191c1b] mb-sm">Simple, Scalable Pricing</h2>
                <p className="font-body-md text-body-md text-[#40493d]">Choose the plan that fits your current hiring velocity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
                {/* Free Tier */}
                <div className="bg-white p-lg rounded-xl border border-[#bfcaba] shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-headline-md text-headline-md mb-xs text-[#191c1b]">Free</h3>
                    <p className="font-label-md text-[#40493d] mb-md">For small startups</p>
                    <div className="mb-lg">
                      <span className="text-[48px] font-extrabold text-[#191c1b]">$0</span>
                      <span className="text-[#40493d]">/mo</span>
                    </div>
                    <ul className="space-y-sm mb-xl">
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> 3 Interviews / mo
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Basic Code Editor
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b] opacity-50">
                        <span className="material-symbols-outlined text-[#707a6c] text-sm">cancel</span> AI Insights
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-sm border border-[#0d631b] text-[#0d631b] rounded-lg font-label-md hover:bg-[#f2f4f2] transition-all"
                  >
                    Get Started
                  </button>
                </div>

                {/* Pro Tier (Featured) */}
                <div className="relative bg-white p-lg rounded-xl border-2 border-[#0d631b] shadow-xl z-10 flex flex-col justify-between h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0d631b] text-white px-md py-xs rounded-full font-label-sm uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md mb-xs text-[#191c1b]">Pro</h3>
                    <p className="font-label-md text-[#40493d] mb-md">For growing teams</p>
                    <div className="mb-lg">
                      <span className="text-[48px] font-extrabold text-[#191c1b]">$99</span>
                      <span className="text-[#40493d]">/mo</span>
                    </div>
                    <ul className="space-y-sm mb-xl">
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b] font-bold">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Unlimited Interviews
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Professional Sandbox
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Full AI Insights
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Interview Recording
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-sm bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded-lg font-label-md transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>

                {/* Custom Tier */}
                <div className="bg-white p-lg rounded-xl border border-[#bfcaba] shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-headline-md text-headline-md mb-xs text-[#191c1b]">Custom</h3>
                    <p className="font-label-md text-[#40493d] mb-md">For enterprise scale</p>
                    <div className="mb-lg">
                      <span className="text-[48px] font-extrabold text-[#191c1b]">Quote</span>
                    </div>
                    <ul className="space-y-sm mb-xl">
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> SSO Integration
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Dedicated Success Manager
                      </li>
                      <li className="flex items-center gap-xs font-label-md text-[#191c1b]">
                        <span className="material-symbols-outlined text-[#0d631b] text-sm">check_circle</span> Custom Legal &amp; Security
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full py-sm border border-[#0d631b] text-[#0d631b] rounded-lg font-label-md hover:bg-[#f2f4f2] transition-all"
                  >
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-xl px-margin-desktop w-full">
            <div className="w-full max-w-[1280px] mx-auto bg-[#0d631b] rounded-2xl p-xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h2 className="font-display-lg text-display-lg text-white mb-md leading-tight">Ready to scale your technical hiring?</h2>
                <p className="font-body-lg text-body-lg text-[#a3f69c] opacity-90 mb-lg max-w-2xl mx-auto">Join 1,000+ engineering teams conducting world-class interviews today.</p>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-white hover:bg-[#a3f69c] text-[#0d631b] px-xl py-md rounded-lg font-title-lg transition-all active:scale-95 shadow-xl"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-[#eceeec] dark:bg-zinc-900 border-t border-[#bfcaba] dark:border-zinc-800 w-full pt-16 pb-12">
          <div className="w-full max-w-[1280px] mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-8 mb-16 text-label-md font-label-md">
            <div className="md:col-span-5 space-y-4">
              <span className="text-2xl font-bold text-[#0d631b] block">InterviewOS</span>
              <p className="text-[#40493d] dark:text-zinc-400 max-w-[320px] leading-relaxed text-body-md">
                Empowering engineering teams to identify top talent through immersive, collaborative technical interviews.
              </p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#191c1b] font-bold">Product</p>
              <ul className="space-y-3">
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Features</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#pricing">Pricing</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Integrations</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Changelog</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#191c1b] font-bold">Company</p>
              <ul className="space-y-3">
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">About</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Careers</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Privacy</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#">Contact</a></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#191c1b] font-bold">Social</p>
              <div className="flex gap-4 items-center">
                <a href="#" className="text-[#40493d] hover:text-[#0d631b] transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.986 0-.213 0-.427-.015-.64A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-[#40493d] hover:text-[#0d631b] transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[1280px] mx-auto px-margin-desktop py-md border-t border-[#bfcaba]/30 flex justify-between items-center text-xs text-[#707a6c] dark:text-zinc-400">
            <p>© 2024 InterviewOS. All rights reserved.</p>
            <div className="flex gap-md">
              <a href="#" className="hover:text-[#0d631b] transition-colors">Status</a>
              <a href="#" className="hover:text-[#0d631b] transition-colors">Cookies</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
