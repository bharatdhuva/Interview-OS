import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { landingContent } from "@/data/landingContent";
import { useAuthStore } from "@/store/authStore";
import manVideo from "@/assets/man.mp4";
import womenVideo from "@/assets/women.mp4";
import "./LandingPage.css";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Wordmark({ large = false, onNavigate }) {
  return (
    <a
      href="#platform"
      onClick={(e) => onNavigate?.(e, "#platform")}
      className={`wordmark ${large ? "wordmark-large" : ""}`}
      aria-label="InterviewOS home"
    >
      InterviewOS<span className="brand-mark" aria-hidden="true" />
    </a>
  );
}

function TechLogo({ name }) {
  switch (name) {
    case "React":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="2.1" fill="#61DAFB" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.5" transform="rotate(120 12 12)" />
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" />
          <path
            d="M13.2 11.4H10.5V19H8.6V11.4H5.9V9.8H13.2V11.4ZM19.2 16.5C19.2 18.1 17.9 19.2 15.8 19.2C14.7 19.2 13.7 18.9 13 18.4L13.6 16.9C14.2 17.3 15 17.6 15.8 17.6C16.8 17.6 17.3 17.2 17.3 16.6C17.3 16 16.8 15.7 15.6 15.3C14 14.7 13.1 13.9 13.1 12.5C13.1 10.9 14.3 9.7 16.3 9.7C17.3 9.7 18.2 9.9 18.9 10.3L18.3 11.8C17.7 11.5 17 11.3 16.3 11.3C15.4 11.3 14.9 11.7 14.9 12.3C14.9 12.9 15.4 13.2 16.6 13.6C18.3 14.2 19.2 15 19.2 16.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    case "Node.js":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
            fill="#539E43"
          />
          <path
            d="M12 6.5L16.8 9.25V14.75L12 17.5L7.2 14.75V9.25L12 6.5Z"
            fill="#FFFFFF"
            fillOpacity="0.2"
          />
          <text x="12" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">
            JS
          </text>
        </svg>
      );
    case "MongoDB":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12.3 2.5C12.3 2.5 16.8 7.6 16.8 13.1C16.8 16.8 14.5 19.3 12.6 20.3V22H11.5V20.3C9.6 19.3 7.3 16.8 7.3 13.1C7.3 7.6 11.8 2.5 11.8 2.5L12 2L12.3 2.5Z"
            fill="#47A248"
          />
          <path d="M12 4.5V20" stroke="#A6E3A1" strokeWidth="0.9" />
        </svg>
      );
    case "AWS":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <text x="12" y="13.5" textAnchor="middle" fill="#232F3E" fontSize="8.5" fontWeight="800" fontFamily="sans-serif">
            aws
          </text>
          <path
            d="M5 16.2C8.8 18.9 14.9 19 19 16.2"
            stroke="#FF9900"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17.2 15.6L19.4 16L18.5 18.1"
            stroke="#FF9900"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "WebRTC":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="8" cy="9" r="3.4" stroke="#E11D48" strokeWidth="1.7" />
          <circle cx="16" cy="9" r="3.4" stroke="#0284C7" strokeWidth="1.7" />
          <circle cx="12" cy="15.5" r="3.4" stroke="#16A34A" strokeWidth="1.7" />
        </svg>
      );
    case "Judge0":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" fill="#171917" />
          <path
            d="M7.5 9.5L10.5 12L7.5 14.5"
            stroke="#00C875"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12.5 14.5H16.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "Socket.IO":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="#111111" />
          <path d="M13.5 6.2L8.2 13H12L10.5 17.8L15.8 11H12L13.5 6.2Z" fill="#FFFFFF" />
        </svg>
      );
    default:
      return null;
  }
}

function VideoFrame({ className, label, crop }) {
  const src = crop === "candidate" ? manVideo : womenVideo;

  return (
    <div className={`video-frame ${className}`}>
      <div className="video-chrome" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className={`video-photo video-photo-${crop}`}>
        <video src={src} autoPlay loop muted playsInline aria-label={label} />
      </div>
      <span className="video-caption">{label}</span>
    </div>
  );
}

const CODE_LINES = [
  <><span className="line-no">01</span> <span className="code-muted">function</span> <span className="code-green">findPair</span>(values, target) {"{"}</>,
  <><span className="line-no">02</span> {"  "}<span className="code-muted">const</span> seen = <span className="code-green">new Map</span>()</>,
  <><span className="line-no">03</span> {"  "}<span className="code-muted">for</span> (<span className="code-muted">const</span> value <span className="code-muted">of</span> values) {"{"}</>,
  <><span className="line-no">04</span> {"    "}<span className="code-muted">const</span> match = target - value</>,
  <><span className="line-no">05</span> {"    "}<span className="code-muted">if</span> (seen.has(match)) {"{"}</>,
  <><span className="line-no">06</span> {"      "}<span className="code-muted">return</span> [seen.get(match), value]</>,
  <><span className="line-no">07</span> {"    }"}</>,
  <><span className="line-no">08</span> {"    "}seen.set(value, value)</>,
  <><span className="line-no">09</span> {"  }"}</>,
  <><span className="line-no">10</span> {"}"}</>,
];

function EditorPreview() {
  const editorRef = useRef(null);
  const isInView = useInView(editorRef, { once: true, amount: 0.35 });
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (visibleLines >= CODE_LINES.length) return;

    const timer = setTimeout(() => {
      setVisibleLines((prev) => Math.min(CODE_LINES.length, prev + 1));
    }, 220);

    return () => clearTimeout(timer);
  }, [isInView, visibleLines]);

  return (
    <motion.div
      ref={editorRef}
      className="editor-preview"
      aria-label="Illustration of the collaborative interview workspace"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      custom={0.15}
    >
      <div className="editor-topbar">
        <span className="editor-dot" />
        <span>{landingContent.sections.editorTitle}</span>
        <span className="editor-live">● LIVE</span>
      </div>
      <div className="editor-body">
        <div className="editor-code" aria-hidden="true">
          <div className="editor-tabs">
            <span>solution.ts</span>
            <span>⌘</span>
          </div>
          <pre>
            {CODE_LINES.slice(0, visibleLines).map((lineContent, idx) => (
              <motion.span
                key={idx}
                className="code-line-row"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {lineContent}
                {idx === visibleLines - 1 && visibleLines < CODE_LINES.length && (
                  <span className="code-cursor" />
                )}
              </motion.span>
            ))}
          </pre>
          <motion.div
            className="editor-output"
            initial={{ opacity: 0 }}
            animate={{ opacity: visibleLines >= CODE_LINES.length ? 1 : 0.25 }}
            transition={{ duration: 0.35 }}
          >
            <span>OUTPUT</span>
            <p>
              Tests passed <b>{visibleLines >= CODE_LINES.length ? "4 / 4" : "Running..."}</b>
            </p>
          </motion.div>
        </div>
        <div className="editor-side">
          <div className="side-label">{landingContent.sections.editorPanel}</div>
          <VideoFrame className="mini-video" label="Candidate" crop="candidate" />
          <div className="side-note">
            <span className="note-avatar">B</span>
            <p>
              <b>{landingContent.sections.editorNoteAuthor}</b>
              <br />
              {landingContent.sections.editorNote}
            </p>
          </div>
          <div className="recording-note">
            <span className="record-dot" /> {landingContent.sections.editorRecording}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AICapabilities() {
  return (
    <section
      className="ai-section frame-shell"
      id="ai-capabilities"
      aria-labelledby="ai-title"
    >
      <motion.div
        className="ai-heading"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
      >
        <p className="eyebrow">{landingContent.sections.aiEyebrow}</p>
        <h2 id="ai-title">
          {landingContent.sections.aiTitle.split("|")[0]}
          <br />
          <span>{landingContent.sections.aiTitle.split("|")[1]}</span>
        </h2>
        <p>{landingContent.sections.aiIntro}</p>
        <div className="ai-principle">
          <span className="principle-mark" aria-hidden="true">
            01
          </span>
          <p>
            <b>{landingContent.sections.aiHumanTitle}</b>
            <br />
            {landingContent.sections.aiHumanDescription}
          </p>
        </div>
      </motion.div>
      <div className="ai-list">
        {landingContent.aiFeatures.map((feature, index) => (
          <motion.article
            className="ai-item"
            key={feature.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={Math.min(index * 0.06, 0.35)}
          >
            <span className="ai-index">0{index + 1}</span>
            <div>
              <div className="ai-title-line">
                <h3>{feature.title}</h3>
                <span
                  className={
                    feature.tag === "Coming soon" ? "ai-tag ai-tag-soon" : "ai-tag"
                  }
                >
                  {feature.tag}
                </span>
              </div>
              <p>{feature.description}</p>
            </div>
            <span className="ai-arrow" aria-hidden="true">
              ↗
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("platform");
  const user = useAuthStore((s) => s.user);
  const dashboardPath =
    user?.role === "interviewer"
      ? "/dashboard/interviewer"
      : "/dashboard/candidate";

  const handleSectionScroll = (e, href) => {
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const update = () => {
      setHasScrolled(window.scrollY > 12);
      const scrollPos = window.scrollY + 140;
      const sections = ["platform", "features", "how-it-works"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="landing-root">
      <main id="platform">
        <header className={`site-header ${hasScrolled ? "is-scrolled" : ""}`}>
          <div className="header-inner">
            <Wordmark onNavigate={handleSectionScroll} />
            <nav aria-label="Main navigation">
              {landingContent.nav.map((item) => {
                const sectionId = item.href.replace("#", "");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleSectionScroll(e, item.href)}
                    className={activeSection === sectionId ? "is-active" : ""}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <div className="header-actions">
              {user ? (
                <Link
                  className="button button-dark button-small"
                  to={dashboardPath}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link className="login-link" to="/login">
                    Log In
                  </Link>
                  <Link
                    className="button button-dark button-small"
                    to="/register"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <section
          className="hero-section frame-shell"
          aria-labelledby="hero-title"
        >
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">{landingContent.sections.heroEyebrow}</p>
            <h1 id="hero-title">
              {landingContent.hero.title}
              <br />
              <span>{landingContent.hero.emphasis}</span>
            </h1>
            <p className="hero-description">{landingContent.hero.description}</p>
            <div className="hero-actions">
              <Link
                className="button button-dark"
                to={user ? dashboardPath : "/register"}
              >
                {landingContent.hero.actions[0]} <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className="button button-outline"
                to={user ? dashboardPath : "/register"}
              >
                {landingContent.hero.actions[1]}
              </Link>
            </div>
            <p className="hero-footnote">{landingContent.sections.heroFootnote}</p>
          </motion.div>
          <motion.div
            className="hero-visual"
            aria-label="A live technical interview in progress"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-wash" />
            <VideoFrame
              className="video-back"
              label="Engineering lead"
              crop="interviewer"
            />
            <VideoFrame
              className="video-front"
              label="Candidate"
              crop="candidate"
            />
            <span className="visual-index">
              01 — {landingContent.sections.liveLabel}
            </span>
          </motion.div>
        </section>

        <section
          className="stack-section frame-shell"
          id="integrations"
          aria-labelledby="stack-title"
        >
          <motion.div
            className="stack-intro"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="eyebrow">{landingContent.sections.stackEyebrow}</p>
            <h2 id="stack-title">
              Integrations
              <br />
              &amp; tech stack
            </h2>
          </motion.div>
          <div className="stack-logos" aria-label="Supported technologies">
            {landingContent.integrations.items.map((item, index) => (
              <motion.span
                className="stack-logo"
                key={item}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                custom={index * 0.05}
              >
                <TechLogo name={item} />
                {item}
              </motion.span>
            ))}
          </div>
        </section>

        <section
          className="features-section frame-shell"
          id="features"
          aria-labelledby="features-title"
        >
          <motion.div
            className="features-heading"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <p className="eyebrow">{landingContent.sections.featuresEyebrow}</p>
            <h2 id="features-title">
              {landingContent.sections.featuresTitle.split("|")[0]}
              <br />
              <span>{landingContent.sections.featuresTitle.split("|")[1]}</span>
            </h2>
            <p>{landingContent.sections.featuresIntro}</p>
          </motion.div>
          <div className="features-content">
            <div className="feature-list">
              {landingContent.features.map((feature, index) => (
                <motion.article
                  className="feature-row"
                  key={feature.number}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={index * 0.08}
                >
                  <span className="feature-number">{feature.number}</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <span className="feature-arrow" aria-hidden="true">
                    ↗
                  </span>
                </motion.article>
              ))}
            </div>
            <EditorPreview />
          </div>
        </section>

        <AICapabilities />

        <section
          className="process-section frame-shell"
          id="how-it-works"
          aria-labelledby="process-title"
        >
          <motion.div
            className="process-heading"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="eyebrow">{landingContent.sections.processEyebrow}</p>
            <h2 id="process-title">{landingContent.sections.processTitle}</h2>
            <p>{landingContent.sections.processIntro}</p>
          </motion.div>
          <div className="timeline">
            {landingContent.steps.map((step, index) => (
              <motion.article
                className={`timeline-step timeline-step-${index + 1}`}
                key={step.number}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                custom={index * 0.12}
              >
                <div className="timeline-meta">
                  <span className="timeline-number">{step.number}</span>
                  {index < landingContent.steps.length - 1 && (
                    <span
                      className={`timeline-line timeline-line-${index + 1}`}
                      aria-hidden="true"
                    >
                      <span className="timeline-line-fill" />
                    </span>
                  )}
                </div>
                <p className="step-kicker">STEP 0{index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section
          className="cta-section frame-shell"
          id="get-started"
          aria-labelledby="cta-title"
        >
          <motion.div
            className="cta-inner"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <p className="eyebrow">{landingContent.sections.ctaEyebrow}</p>
            <h2 id="cta-title">
              {landingContent.sections.ctaTitle.split("|")[0]}
              <br />
              <span>{landingContent.sections.ctaTitle.split("|")[1]}</span>
            </h2>
            <div className="cta-actions">
              <Link
                className="button button-dark"
                to={user ? dashboardPath : "/register"}
              >
                {landingContent.sections.ctaPrimary}{" "}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className="button button-outline"
                to={user ? dashboardPath : "/login"}
              >
                {landingContent.sections.ctaSecondary}
              </Link>
            </div>
            <span className="cta-index" aria-hidden="true">
              INTERVIEWOS / 2026
            </span>
          </motion.div>
        </section>

        <footer className="site-footer" id="footer">
          <div className="footer-inner">
            <div className="footer-main">
              <div className="footer-brand">
                <Wordmark large onNavigate={handleSectionScroll} />
                <p>{landingContent.footer.description}</p>
                <Link
                  className="button button-dark footer-cta"
                  to={user ? dashboardPath : "/register"}
                >
                  Get started <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="footer-columns">
                {landingContent.footer.columns.slice(0, 2).map((column) => (
                  <div className="footer-column" key={column.title}>
                    <h2>{column.title}</h2>
                    {column.links.map((link) => {
                      const hashMap = {
                        Features: "#features",
                        "How It Works": "#how-it-works",
                        Integrations: "#integrations",
                      };
                      const routeMap = {
                        Changelog: "/changelog",
                        About: "/about",
                        Careers: "/careers",
                        Privacy: "/privacy",
                        Contact: "/contact",
                      };
                      if (hashMap[link]) {
                        return (
                          <a
                            href={hashMap[link]}
                            onClick={(e) => handleSectionScroll(e, hashMap[link])}
                            key={link}
                          >
                            {link}
                          </a>
                        );
                      }
                      return (
                        <Link to={routeMap[link] || "/"} key={link}>
                          {link}
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <div className="footer-column">
                  <h2>Social</h2>
                  <div className="footer-socials">
                    <a
                      href="https://linkedin.com/in/bharatdhuva27"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      aria-label="LinkedIn"
                    >
                      in
                    </a>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      aria-label="X"
                    >
                      𝕏
                    </a>
                    <a
                      href="https://github.com/bharatdhuva/Interview-OS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-btn"
                      aria-label="GitHub"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.64 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>{landingContent.sections.footerCopyright}</p>
            </div>
          </div>
          <div className="footer-watermark" aria-hidden="true">
            InterviewOS
          </div>
        </footer>
      </main>
    </div>
  );
}
