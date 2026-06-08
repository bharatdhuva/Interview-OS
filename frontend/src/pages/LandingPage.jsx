import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import manVideo from "../assets/man.mp4";
import womenVideo from "../assets/women.mp4";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("platform");

  useEffect(() => {
    // Default URL hash to #platform on initial mount if empty
    if (!window.location.hash || window.location.hash === "#") {
      window.location.hash = "#platform";
    }
  }, []);

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

      // Scroll spy logic for active navigation section
      const sections = ["platform", "features", "how-it-works"];
      const scrollPosition = window.scrollY + 120; // offset for the header height

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger scroll check on mount
    handleScroll();
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
          font-size: 32px !important;
          line-height: 40px !important;
          letter-spacing: -0.02em !important;
          font-weight: 700 !important;
        }
        @media (min-width: 768px) {
          .font-display-lg, .text-display-lg {
            font-size: 40px !important;
            line-height: 48px !important;
          }
        }
        @media (min-width: 1024px) {
          .font-display-lg, .text-display-lg {
            font-size: 48px !important;
            line-height: 56px !important;
          }
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

        /* Responsive Mockup Video Container & Overlap Shifts */
        .mockup-container {
          position: relative !important;
          height: 320px !important;
        }
        .mockup-woman {
          position: absolute !important;
          top: 0px !important;
          right: 0px !important;
          width: 60% !important;
        }
        .mockup-man {
          position: absolute !important;
          top: 100px !important;
          left: -10px !important;
          width: 62% !important;
        }
        .mockup-dots {
          position: absolute !important;
          z-index: 5 !important;
          top: 140px !important;
          right: 20px !important;
        }
        @media (min-width: 768px) {
          .mockup-container {
            height: 380px !important;
          }
          .mockup-woman {
            top: 20px !important;
            right: 10px !important;
          }
          .mockup-man {
            top: 130px !important;
            left: -20px !important;
          }
          .mockup-dots {
            top: 180px !important;
            right: 40px !important;
          }
        }
        @media (min-width: 1024px) {
          .mockup-container {
            height: 480px !important;
          }
          .mockup-woman {
            top: 0px !important;
            right: 0px !important;
          }
          .mockup-man {
            top: 170px !important;
            left: -40px !important;
          }
          .mockup-dots {
            top: 220px !important;
            right: 60px !important;
          }
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

        /* Custom Social Links & Popup Tooltip */
        .social-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(13, 99, 27, 0.06);
          color: #40493d !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .dark .social-link {
          background: rgba(136, 217, 130, 0.08);
          color: #a1a1aa !important;
        }

        .social-link:hover {
          color: #ffffff !important;
          background: #0d631b !important;
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(13, 99, 27, 0.3);
        }

        .dark .social-link:hover {
          color: #191c1b !important;
          background: #88d982 !important;
          box-shadow: 0 4px 12px rgba(136, 217, 130, 0.3);
        }

        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: #191c1b;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          margin-bottom: 8px;
          z-index: 100;
        }

        .dark .tooltip {
          background: #ffffff;
          color: #191c1b;
        }

        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: #191c1b transparent transparent transparent;
        }

        .dark .tooltip::after {
          border-color: #ffffff transparent transparent transparent;
        }

        .social-link:hover .tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      ` }} />

      <div className="landing-container bg-background text-on-background min-h-screen w-full flex flex-col items-center">
        {/* TopNavBar */}
        <header className="bg-surface dark:bg-background shadow-sm fixed top-0 left-0 right-0 h-20 transition-all duration-300 z-50">
          <nav className="flex justify-between items-center w-full px-12 max-w-[1280px] mx-auto h-full">
            <div className="flex items-center gap-base">
              <span className="text-title-lg font-title-lg font-bold text-[#0d631b]">InterviewOS</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-lg items-center text-body-md font-body-md">
              <a
                className={`hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 pb-1 transition-all cursor-pointer active:scale-95 duration-200 ${
                  activeSection === "platform"
                    ? "text-[#0d631b] border-[#0d631b]"
                    : "text-[#40493d] border-transparent"
                }`}
                href="#platform"
              >
                Platform
              </a>
              <a
                className={`hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 pb-1 transition-all cursor-pointer active:scale-95 duration-200 ${
                  activeSection === "features"
                    ? "text-[#0d631b] border-[#0d631b]"
                    : "text-[#40493d] border-transparent"
                }`}
                href="#features"
              >
                Features
              </a>
              <a
                className={`hover:text-[#0d631b] hover:border-[#0d631b] border-b-2 pb-1 transition-all cursor-pointer active:scale-95 duration-200 ${
                  activeSection === "how-it-works"
                    ? "text-[#0d631b] border-[#0d631b]"
                    : "text-[#40493d] border-transparent"
                }`}
                href="#how-it-works"
              >
                How It Works
              </a>
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
              
              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="block md:hidden text-[#40493d] hover:text-[#0d631b] transition-all duration-200 ml-2"
                aria-label="Toggle Menu"
              >
                <span className="material-symbols-outlined text-3xl">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#bfcaba]/30 py-6 px-12 z-40 transition-all duration-300 animate-in-up">
              <div className="flex flex-col gap-6 font-title-lg text-title-lg text-[#40493d]">
                <a
                  href="#platform"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors hover:text-[#0d631b] ${
                    activeSection === "platform" ? "text-[#0d631b] font-bold" : "text-[#40493d]"
                  }`}
                >
                  Platform
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors hover:text-[#0d631b] ${
                    activeSection === "features" ? "text-[#0d631b] font-bold" : "text-[#40493d]"
                  }`}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors hover:text-[#0d631b] ${
                    activeSection === "how-it-works" ? "text-[#0d631b] font-bold" : "text-[#40493d]"
                  }`}
                >
                  How It Works
                </a>
                <div className="h-px bg-[#bfcaba]/30 my-2" />
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="text-left hover:text-[#0d631b] transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/register");
                  }}
                  className="bg-[#0d631b] hover:bg-[#2e7d32] text-white py-sm px-md rounded text-center transition-all cursor-pointer font-label-md"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="pt-20 overflow-x-hidden w-full flex flex-col items-center">
          {/* Hero Section */}
          <section id="platform" className="hero-gradient relative hero-padding w-full">
            <div className="w-full max-w-[1280px] mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-lg items-center lg:pt-6">
              <div className="flex flex-col gap-5">
                <h1 className="font-display-lg text-display-lg text-[#191c1b] leading-tight">
                  The Engineering<br />
                  Leader's <span className="text-[#0d631b]">Technical<br />
                    Interview Platform.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-[#40493d] max-w-xl">
                  A collaborative environment designed for elite engineering teams. Real-time code execution, persistent whiteboards, and interactive video features that reveal a candidate's true potential.
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
              </div>
              <div className="relative w-full max-w-[550px] lg:ml-16 lg:mr-auto mx-auto mt-6 lg:mt-0 mockup-container">

                {/* Dot Grid */}
                <div className="mockup-dots" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 7px)', gap: '6px' }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0d631b', opacity: 0.3 }} />
                  ))}
                </div>

                {/* TOP-RIGHT Window — Women Video (dark titlebar) */}
                <div className="mockup-woman" style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
                  border: '1px solid rgba(0,0,0,0.10)'
                }}>
                  <div style={{ background: '#0d1a12', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a4d2e', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2d8653', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#5ec992', display: 'inline-block' }} />
                  </div>
                  <video
                    src={womenVideo}
                    autoPlay loop muted playsInline
                    style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                </div>

                {/* BOTTOM-LEFT Window — Man Video (light titlebar) */}
                <div className="mockup-man" style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 20,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <div style={{ background: '#d6ede0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a4d2e', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2d8653', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#5ec992', display: 'inline-block' }} />
                  </div>
                  <video
                    src={manVideo}
                    autoPlay loop muted playsInline
                    style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                </div>

              </div>
            </div>
          </section>


          {/* Integrations & Tech Stack */}
          <section id="features" className="py-20 bg-background w-full border-t border-[#bfcaba]/30">
            <div className="w-full max-w-[1280px] mx-auto px-12 grid grid-cols-1 lg:grid-cols-12 gap-y-12 gap-x-8 items-center py-8">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75" />
                    </svg>
                    <span>MongoDB</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                    </svg>
                    <span>AWS</span>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8 7L3 12l5 5M16 7l5 5-5 5M3 12h18" />
                    </svg>
                    <span>WebRTC</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                    <span>Judge0</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-lg text-zinc-700 dark:text-zinc-300">
                    <svg className="w-6 h-6 text-[#707a6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-12L21 9m0 0l-4.5 4.5M21 9H7.5" />
                    </svg>
                    <span>Socket.IO</span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Key Features Section */}
          <section id="key-features" className="py-20 bg-[#f2f4f2] w-full border-t border-[#bfcaba]/30">
            <div className="w-full max-w-[1280px] mx-auto px-12">
              <div className="text-center mb-xl">
                <h2 className="font-headline-lg text-headline-lg text-[#191c1b] mb-sm">Key Features</h2>
                <p className="font-body-md text-body-md text-[#40493d] max-w-xl mx-auto">
                  A complete environment designed to evaluate candidate skills comprehensively and efficiently.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                {/* Feature 1 */}
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b] shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">code</span>
                  </div>
                  <div>
                    <h3 className="font-title-lg text-[#191c1b] font-bold mb-2">Collaborative Code Editor</h3>
                    <p className="font-body-md text-[#40493d] leading-relaxed">
                      Real-time code execution with Judge0. Multiple programming languages supported.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b] shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">search</span>
                  </div>
                  <div>
                    <h3 className="font-title-lg text-[#191c1b] font-bold mb-2">Search Internet</h3>
                    <p className="font-body-md text-[#40493d] leading-relaxed">
                      Enable candidates to search the internet or reference external documentation directly within the room.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b] shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">videocam</span>
                  </div>
                  <div>
                    <h3 className="font-title-lg text-[#191c1b] font-bold mb-2">Live Video Interviews</h3>
                    <p className="font-body-md text-[#40493d] leading-relaxed">
                      WebRTC-based video calls with zero plugin requirements.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-xl bg-[#0d631b]/10 flex items-center justify-center text-[#0d631b] shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-3xl">fiber_manual_record</span>
                  </div>
                  <div>
                    <h3 className="font-title-lg text-[#191c1b] font-bold mb-2">Interview Recording</h3>
                    <p className="font-body-md text-[#40493d] leading-relaxed">
                      Sessions are recorded and stored for async review by hiring teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 bg-background w-full border-t border-[#bfcaba]/30">
            <div className="w-full max-w-[1280px] mx-auto px-12">
              <div className="text-center mb-xl">
                <h2 className="font-headline-lg text-headline-lg text-[#191c1b] mb-sm">How It Works</h2>
                <p className="font-body-md text-body-md text-[#40493d] max-w-xl mx-auto">
                  A seamless workflow from room creation to final feedback generation.
                </p>
              </div>

              <div className="relative flex flex-col md:flex-row gap-lg md:gap-md justify-between items-start">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-[#bfcaba] z-0"></div>

                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-[#0d631b] flex items-center justify-center font-bold text-2xl text-[#0d631b] shadow-md mb-md">
                    1
                  </div>
                  <h3 className="font-title-lg text-[#191c1b] font-bold mb-sm">Create a Room</h3>
                  <p className="font-body-md text-[#40493d] max-w-xs px-2">
                    Generate a unique interview session with custom problem sets.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-[#0d631b] flex items-center justify-center font-bold text-2xl text-[#0d631b] shadow-md mb-md">
                    2
                  </div>
                  <h3 className="font-title-lg text-[#191c1b] font-bold mb-sm">Conduct the Interview</h3>
                  <p className="font-body-md text-[#40493d] max-w-xs px-2">
                    Candidate joins via link. Code, communicate, and solve live.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center flex-1 z-10">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-[#0d631b] flex items-center justify-center font-bold text-2xl text-[#0d631b] shadow-md mb-md">
                    3
                  </div>
                  <h3 className="font-title-lg text-[#191c1b] font-bold mb-sm">Review &amp; Decide</h3>
                  <p className="font-body-md text-[#40493d] max-w-xs px-2">
                    Detailed transcripts + full recording available instantly after session ends.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-xl px-12 w-full border-t border-[#bfcaba]/30">
            <div className="w-full max-w-[1280px] mx-auto bg-[#0d631b] rounded-2xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <h2 className="font-display-lg text-display-lg text-white mb-lg leading-tight">Ready to scale your technical hiring?</h2>
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
          <div className="w-full max-w-[1280px] mx-auto px-12 grid grid-cols-1 md:grid-cols-12 gap-y-8 gap-x-8 mb-16 text-label-md font-label-md">
            <div className="md:col-span-5 space-y-4">
              <span className="text-2xl font-bold text-[#0d631b] block">InterviewOS</span>
              <p className="text-[#40493d] dark:text-zinc-400 max-w-[320px] leading-relaxed text-body-md">
                Empowering engineering teams to identify top talent through immersive, collaborative technical interviews.
              </p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#191c1b] font-bold">Product</p>
              <ul className="space-y-3">
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#key-features">Features</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#how-it-works">How It Works</a></li>
                <li><a className="text-[#40493d] dark:text-zinc-400 hover:text-[#0d631b] transition-colors" href="#features">Integrations</a></li>
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
                <a
                  href="https://linkedin.com/in/bharatdhuva27"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="tooltip">LinkedIn</span>
                </a>
                <a
                  href="https://x.com/mrcrotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="X"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="tooltip">X (Twitter)</span>
                </a>
                <a
                  href="https://github.com/bharatdhuva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span className="tooltip">GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[1280px] mx-auto px-12 py-md border-t border-[#bfcaba]/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#707a6c] dark:text-zinc-400">
            <p>© 2024 InterviewOS. All rights reserved.</p>
            <p className="font-semibold text-center select-none">
              Made with <span className="text-[#0d631b] dark:text-[#88d982] animate-pulse">❤️</span> by <a href="https://github.com/bharatdhuva" target="_blank" rel="noopener noreferrer" className="hover:text-[#0d631b] dark:hover:text-[#88d982] transition-colors duration-300 underline underline-offset-4 font-bold">Bharat Dhuva</a>
            </p>
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
