'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { landingContent } from '@/lib/landing-content'


function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <a href="#platform" className={`wordmark ${large ? 'wordmark-large' : ''}`} aria-label="InterviewOS home">
      InterviewOS<span className="brand-mark" aria-hidden="true" />
    </a>
  )
}

function VideoFrame({ className, label, crop }: { className: string; label: string; crop: 'candidate' | 'interviewer' }) {
  return (
    <div className={`video-frame ${className}`}>
      <div className="video-chrome" aria-hidden="true"><i /><i /><i /></div>
      <div className={`video-photo video-photo-${crop}`}>
        <Image src={crop === 'candidate' ? '/portraits/candidate.png' : '/portraits/interviewer.png'} alt={label} fill sizes="(max-width: 700px) 70vw, 360px" />
      </div>
      <span className="video-caption">{label}</span>
    </div>
  )
}

function EditorPreview() {
  return (
    <div className="editor-preview" aria-label="Illustration of the collaborative interview workspace">
      <div className="editor-topbar"><span className="editor-dot" /><span>{landingContent.sections.editorTitle}</span><span className="editor-live">● LIVE</span></div>
      <div className="editor-body">
        <div className="editor-code" aria-hidden="true">
          <div className="editor-tabs"><span>solution.ts</span><span>⌘</span></div>
          <pre><span className="line-no">01</span> <span className="code-muted">function</span> <span className="code-green">findPair</span>(values, target) {'{'}{'\n'}<span className="line-no">02</span>   <span className="code-muted">const</span> seen = <span className="code-green">new Map</span>(){'\n'}<span className="line-no">03</span>   <span className="code-muted">for</span> (<span className="code-muted">const</span> value <span className="code-muted">of</span> values) {'{'}{'\n'}<span className="line-no">04</span>     <span className="code-muted">const</span> match = target - value{'\n'}<span className="line-no">05</span>     <span className="code-muted">if</span> (seen.has(match)) {'{'}{'\n'}<span className="line-no">06</span>       <span className="code-muted">return</span> [seen.get(match), value]{'\n'}<span className="line-no">07</span>     {'}'}{'\n'}<span className="line-no">08</span>     seen.set(value, value){'\n'}<span className="line-no">09</span>   {'}'}{'\n'}<span className="line-no">10</span>{'}'}</pre>
          <div className="editor-output"><span>OUTPUT</span><p>Tests passed <b>4 / 4</b></p></div>
        </div>
        <div className="editor-side">
          <div className="side-label">{landingContent.sections.editorPanel}</div>
          <VideoFrame className="mini-video" label="Candidate" crop="candidate" />
          <div className="side-note"><span className="note-avatar">B</span><p><b>{landingContent.sections.editorNoteAuthor}</b><br />{landingContent.sections.editorNote}</p></div>
          <div className="recording-note"><span className="record-dot" /> {landingContent.sections.editorRecording}</div>
        </div>
      </div>
    </div>
  )
}

function AICapabilities() {
  return (
    <section className="ai-section frame-shell" id="ai-capabilities" aria-labelledby="ai-title">
      <div className="ai-heading">
        <p className="eyebrow">{landingContent.sections.aiEyebrow}</p>
        <h2 id="ai-title">{landingContent.sections.aiTitle.split('|')[0]}<br /><span>{landingContent.sections.aiTitle.split('|')[1]}</span></h2>
        <p>{landingContent.sections.aiIntro}</p>
        <div className="ai-principle"><span className="principle-mark" aria-hidden="true">01</span><p><b>{landingContent.sections.aiHumanTitle}</b><br />{landingContent.sections.aiHumanDescription}</p></div>
      </div>
      <div className="ai-list">
        {landingContent.aiFeatures.map((feature, index) => (
          <article className="ai-item" key={feature.title}>
            <span className="ai-index">0{index + 1}</span>
            <div><div className="ai-title-line"><h3>{feature.title}</h3><span className={feature.tag === 'Coming soon' ? 'ai-tag ai-tag-soon' : 'ai-tag'}>{feature.tag}</span></div><p>{feature.description}</p></div>
            <span className="ai-arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function InterviewOSLanding() {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > 12)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <main id="platform">
      <header className={`site-header ${hasScrolled ? 'is-scrolled' : ''}`}>
        <div className="header-inner"><Wordmark />
          <nav aria-label="Main navigation">{landingContent.nav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
          <div className="header-actions"><a className="login-link" href="#footer">Log In</a><a className="button button-dark button-small" href="#get-started">Get Started</a></div>
        </div>
      </header>

      <section className="hero-section frame-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{landingContent.sections.heroEyebrow}</p>
          <h1 id="hero-title">{landingContent.hero.title}<br /><span>{landingContent.hero.emphasis}</span></h1>
          <p className="hero-description">{landingContent.hero.description}</p>
          <div className="hero-actions"><a className="button button-dark" href="#get-started">{landingContent.hero.actions[0]} <span aria-hidden="true">↗</span></a><a className="button button-outline" href="#get-started">{landingContent.hero.actions[1]}</a></div>
          <p className="hero-footnote">{landingContent.sections.heroFootnote}</p>
        </div>
        <div className="hero-visual" aria-label="A live technical interview in progress">
          <div className="hero-wash" />
          <VideoFrame className="video-back" label="Engineering lead" crop="interviewer" />
          <VideoFrame className="video-front" label="Candidate" crop="candidate" />
          <span className="visual-index">01 — {landingContent.sections.liveLabel}</span>
        </div>
      </section>

      <section className="stack-section frame-shell" aria-labelledby="stack-title">
        <div className="stack-intro"><p className="eyebrow">{landingContent.sections.stackEyebrow}</p><h2 id="stack-title">Integrations<br />&amp; tech stack</h2><p>{landingContent.integrations.intro}</p></div>
        <div className="stack-logos" aria-label="Supported technologies">{landingContent.integrations.items.map((item, index) => <span className="stack-logo" key={item}><i aria-hidden="true">{['◈', '⌘', '▣', '◉', '☁', '↔', '</>', '⇄'][index]}</i>{item}</span>)}</div>
      </section>

      <section className="features-section frame-shell" id="features" aria-labelledby="features-title">
        <div className="features-heading"><p className="eyebrow">{landingContent.sections.featuresEyebrow}</p><h2 id="features-title">{landingContent.sections.featuresTitle.split('|')[0]}<br /><span>{landingContent.sections.featuresTitle.split('|')[1]}</span></h2><p>{landingContent.sections.featuresIntro}</p></div>
        <div className="features-content"><div className="feature-list">{landingContent.features.map((feature) => <article className="feature-row" key={feature.number}><span className="feature-number">{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span className="feature-arrow" aria-hidden="true">↗</span></article>)}</div><EditorPreview /></div>
      </section>

      <AICapabilities />

      <section className="process-section frame-shell" id="how-it-works" aria-labelledby="process-title">
        <div className="process-heading"><p className="eyebrow">{landingContent.sections.processEyebrow}</p><h2 id="process-title">{landingContent.sections.processTitle}</h2><p>{landingContent.sections.processIntro}</p></div>
        <div className="timeline">{landingContent.steps.map((step, index) => <article className="timeline-step" key={step.number}><div className="timeline-meta"><span className="timeline-number">{step.number}</span><span className="timeline-line" /></div><p className="step-kicker">STEP 0{index + 1}</p><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
      </section>

      <section className="cta-section frame-shell" id="get-started" aria-labelledby="cta-title">
        <div className="cta-inner"><p className="eyebrow">{landingContent.sections.ctaEyebrow}</p><h2 id="cta-title">{landingContent.sections.ctaTitle.split('|')[0]}<br /><span>{landingContent.sections.ctaTitle.split('|')[1]}</span></h2><div className="cta-actions"><a className="button button-dark" href="mailto:hello@interviewos.io">{landingContent.sections.ctaPrimary} <span aria-hidden="true">↗</span></a><a className="button button-outline" href="mailto:hello@interviewos.io">{landingContent.sections.ctaSecondary}</a></div><span className="cta-index" aria-hidden="true">INTERVIEWOS / 2026</span></div>
      </section>

      <footer className="site-footer frame-shell" id="footer">
        <div className="footer-main"><div className="footer-brand"><Wordmark large /><p>{landingContent.footer.description}</p></div><div className="footer-columns">{landingContent.footer.columns.map((column) => <div className="footer-column" key={column.title}><h2>{column.title}</h2>{column.links.map((link) => <a href={link === 'How It Works' ? '#how-it-works' : link === 'Features' ? '#features' : '#footer'} key={link}>{link}</a>)}</div>)}</div></div>
        <div className="footer-bottom"><p>{landingContent.sections.footerCopyright}</p><p>Made with <span className="heart">♥</span> by <a href="#footer">{landingContent.sections.footerCredit}</a></p><div><a href="#footer">{landingContent.sections.footerStatus}</a><a href="#footer">{landingContent.sections.footerCookies}</a></div></div>
      </footer>
    </main>
  )
}
